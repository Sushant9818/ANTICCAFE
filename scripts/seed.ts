import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function seed() {
  console.log("Seeding database...");

  // Categories
  const categories = await Promise.all([
    db.menu_categories.upsert({
      where: { slug: "coffee" },
      update: {},
      create: { name: "Coffee", slug: "coffee", sort_order: 1 },
    }),
    db.menu_categories.upsert({
      where: { slug: "tea-drinks" },
      update: {},
      create: { name: "Tea & Drinks", slug: "tea-drinks", sort_order: 2 },
    }),
    db.menu_categories.upsert({
      where: { slug: "pastries" },
      update: {},
      create: { name: "Pastries", slug: "pastries", sort_order: 3 },
    }),
    db.menu_categories.upsert({
      where: { slug: "breakfast" },
      update: {},
      create: { name: "Breakfast", slug: "breakfast", sort_order: 4 },
    }),
    db.menu_categories.upsert({
      where: { slug: "lunch" },
      update: {},
      create: { name: "Lunch", slug: "lunch", sort_order: 5 },
    }),
  ]);

  console.log(`Created ${categories.length} categories`);

  const coffeeId = categories.find((c) => c.slug === "coffee")?.id;
  const teaId = categories.find((c) => c.slug === "tea-drinks")?.id;
  const pastriesId = categories.find((c) => c.slug === "pastries")?.id;
  const breakfastId = categories.find((c) => c.slug === "breakfast")?.id;
  const lunchId = categories.find((c) => c.slug === "lunch")?.id;

  if (!coffeeId || !teaId || !pastriesId || !breakfastId || !lunchId) {
    console.log("Categories already exist, skipping items seed.");
    await db.$disconnect();
    process.exit(0);
  }

  // Menu items
  const itemsToCreate = [
    // Coffee
    { category_id: coffeeId, name: "Espresso", slug: "espresso", description: "Double shot of our house blend.", price: "3.50", is_featured: false, is_vegetarian: true, is_vegan: true, sort_order: 1 },
    { category_id: coffeeId, name: "Signature Latte", slug: "signature-latte", description: "Espresso with silky steamed milk and a touch of vanilla.", price: "5.50", is_featured: true, is_vegetarian: true, sort_order: 2 },
    { category_id: coffeeId, name: "Cappuccino", slug: "cappuccino", description: "Equal parts espresso, steamed milk, and froth.", price: "4.75", is_vegetarian: true, sort_order: 3 },
    { category_id: coffeeId, name: "Cold Brew", slug: "cold-brew", description: "18-hour steeped, smooth and rich. Served over ice.", price: "5.00", is_featured: true, is_vegetarian: true, is_vegan: true, sort_order: 4 },
    { category_id: coffeeId, name: "Flat White", slug: "flat-white", description: "Ristretto shots with velvety microfoam.", price: "5.00", is_vegetarian: true, sort_order: 5 },
    // Tea & Drinks
    { category_id: teaId, name: "Matcha Latte", slug: "matcha-latte", description: "Ceremonial grade matcha with oat milk and honey.", price: "6.00", is_featured: true, is_vegetarian: true, sort_order: 1 },
    { category_id: teaId, name: "Chai Latte", slug: "chai-latte", description: "House-spiced chai concentrate with steamed milk.", price: "5.50", is_vegetarian: true, sort_order: 2 },
    { category_id: teaId, name: "Fresh Juice", slug: "fresh-juice", description: "Ask about today's seasonal blend.", price: "6.50", is_vegetarian: true, is_vegan: true, is_gluten_free: true, sort_order: 3 },
    // Pastries
    { category_id: pastriesId, name: "Almond Croissant", slug: "almond-croissant", description: "Buttery croissant filled with rich almond cream and toasted almonds.", price: "4.75", is_featured: true, is_vegetarian: true, sort_order: 1 },
    { category_id: pastriesId, name: "Butter Croissant", slug: "butter-croissant", description: "Classic French-style, baked fresh every morning.", price: "3.75", is_vegetarian: true, sort_order: 2 },
    { category_id: pastriesId, name: "Blueberry Muffin", slug: "blueberry-muffin", description: "Moist, bursting with blueberries, lemon zest.", price: "3.50", is_vegetarian: true, sort_order: 3 },
    { category_id: pastriesId, name: "Banana Bread", slug: "banana-bread", description: "Dense and moist with walnuts and a hint of cinnamon.", price: "4.00", is_vegetarian: true, sort_order: 4 },
    // Breakfast
    { category_id: breakfastId, name: "Avocado Toast", slug: "avocado-toast", description: "Sourdough, smashed avocado, cherry tomatoes, microgreens, everything bagel spice.", price: "12.00", is_featured: true, is_vegetarian: true, is_vegan: true, sort_order: 1 },
    { category_id: breakfastId, name: "Acai Bowl", slug: "acai-bowl", description: "Thick acai blend, granola, banana, berries, honey.", price: "13.50", is_vegetarian: true, is_gluten_free: true, sort_order: 2 },
    { category_id: breakfastId, name: "Egg & Cheese Sandwich", slug: "egg-cheese-sandwich", description: "Scrambled eggs, aged cheddar, everything bagel or brioche.", price: "9.50", is_vegetarian: true, sort_order: 3 },
    { category_id: breakfastId, name: "Overnight Oats", slug: "overnight-oats", description: "Chia seeds, oat milk, seasonal fruit, maple syrup.", price: "8.00", is_vegetarian: true, is_vegan: true, is_gluten_free: true, sort_order: 4 },
    // Lunch
    { category_id: lunchId, name: "Grain Bowl", slug: "grain-bowl", description: "Quinoa, roasted veggies, feta, hummus, lemon tahini dressing.", price: "14.50", is_featured: true, is_vegetarian: true, is_gluten_free: true, sort_order: 1 },
    { category_id: lunchId, name: "Turkey Sandwich", slug: "turkey-sandwich", description: "Roast turkey, avocado, Swiss, arugula, whole grain mustard on sourdough.", price: "13.00", sort_order: 2 },
    { category_id: lunchId, name: "Caprese Panini", slug: "caprese-panini", description: "Fresh mozzarella, heirloom tomatoes, basil pesto, balsamic glaze.", price: "12.50", is_vegetarian: true, sort_order: 3 },
    { category_id: lunchId, name: "Lentil Soup", slug: "lentil-soup", description: "Hearty red lentil with cumin, lemon, and herbs. Served with bread.", price: "9.00", is_vegetarian: true, is_vegan: true, is_gluten_free: true, sort_order: 4 },
  ];

  let createdCount = 0;
  for (const item of itemsToCreate) {
    const result = await db.menu_items.upsert({
      where: { slug: item.slug },
      update: {},
      create: item as any,
    });
    createdCount++;
  }

  console.log(`Created ${createdCount} menu items`);

  // Restaurant settings
  const settingsToCreate = [
    { key: "cafe_name", value: "AnticCafe" },
    { key: "is_open", value: true },
    { key: "accepts_pickup", value: true },
    { key: "accepts_delivery", value: true },
    { key: "tax_rate", value: 0.0875 },
  ];

  for (const setting of settingsToCreate) {
    await db.restaurant_settings.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: { key: setting.key, value: setting.value },
    });
  }

  console.log("Seed complete!");
  await db.$disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
