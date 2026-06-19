import { config } from "dotenv";
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/db/schema";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL!;
const client = postgres(connectionString, { prepare: false });
const db = drizzle(client, { schema });
import { menuCategories, menuItems, staff, restaurantSettings } from "../src/db/schema";

async function seed() {
  console.log("Seeding database...");

  // Categories
  const categories = await db
    .insert(menuCategories)
    .values([
      { name: "Coffee", slug: "coffee", sortOrder: 1 },
      { name: "Tea & Drinks", slug: "tea-drinks", sortOrder: 2 },
      { name: "Pastries", slug: "pastries", sortOrder: 3 },
      { name: "Breakfast", slug: "breakfast", sortOrder: 4 },
      { name: "Lunch", slug: "lunch", sortOrder: 5 },
    ])
    .onConflictDoNothing()
    .returning();

  console.log(`Created ${categories.length} categories`);

  const coffeeId = categories.find((c) => c.slug === "coffee")?.id;
  const teaId = categories.find((c) => c.slug === "tea-drinks")?.id;
  const pastriesId = categories.find((c) => c.slug === "pastries")?.id;
  const breakfastId = categories.find((c) => c.slug === "breakfast")?.id;
  const lunchId = categories.find((c) => c.slug === "lunch")?.id;

  if (!coffeeId || !teaId || !pastriesId || !breakfastId || !lunchId) {
    console.log("Categories already exist, skipping items seed.");
    return;
  }

  // Menu items
  const items = await db
    .insert(menuItems)
    .values([
      // Coffee
      { categoryId: coffeeId, name: "Espresso", slug: "espresso", description: "Double shot of our house blend.", price: "3.50", isFeatured: false, isVegetarian: true, isVegan: true, sortOrder: 1 },
      { categoryId: coffeeId, name: "Signature Latte", slug: "signature-latte", description: "Espresso with silky steamed milk and a touch of vanilla.", price: "5.50", isFeatured: true, isVegetarian: true, sortOrder: 2 },
      { categoryId: coffeeId, name: "Cappuccino", slug: "cappuccino", description: "Equal parts espresso, steamed milk, and froth.", price: "4.75", isVegetarian: true, sortOrder: 3 },
      { categoryId: coffeeId, name: "Cold Brew", slug: "cold-brew", description: "18-hour steeped, smooth and rich. Served over ice.", price: "5.00", isFeatured: true, isVegetarian: true, isVegan: true, sortOrder: 4 },
      { categoryId: coffeeId, name: "Flat White", slug: "flat-white", description: "Ristretto shots with velvety microfoam.", price: "5.00", isVegetarian: true, sortOrder: 5 },
      // Tea & Drinks
      { categoryId: teaId, name: "Matcha Latte", slug: "matcha-latte", description: "Ceremonial grade matcha with oat milk and honey.", price: "6.00", isFeatured: true, isVegetarian: true, sortOrder: 1 },
      { categoryId: teaId, name: "Chai Latte", slug: "chai-latte", description: "House-spiced chai concentrate with steamed milk.", price: "5.50", isVegetarian: true, sortOrder: 2 },
      { categoryId: teaId, name: "Fresh Juice", slug: "fresh-juice", description: "Ask about today's seasonal blend.", price: "6.50", isVegetarian: true, isVegan: true, isGlutenFree: true, sortOrder: 3 },
      // Pastries
      { categoryId: pastriesId, name: "Almond Croissant", slug: "almond-croissant", description: "Buttery croissant filled with rich almond cream and toasted almonds.", price: "4.75", isFeatured: true, isVegetarian: true, sortOrder: 1 },
      { categoryId: pastriesId, name: "Butter Croissant", slug: "butter-croissant", description: "Classic French-style, baked fresh every morning.", price: "3.75", isVegetarian: true, sortOrder: 2 },
      { categoryId: pastriesId, name: "Blueberry Muffin", slug: "blueberry-muffin", description: "Moist, bursting with blueberries, lemon zest.", price: "3.50", isVegetarian: true, sortOrder: 3 },
      { categoryId: pastriesId, name: "Banana Bread", slug: "banana-bread", description: "Dense and moist with walnuts and a hint of cinnamon.", price: "4.00", isVegetarian: true, sortOrder: 4 },
      // Breakfast
      { categoryId: breakfastId, name: "Avocado Toast", slug: "avocado-toast", description: "Sourdough, smashed avocado, cherry tomatoes, microgreens, everything bagel spice.", price: "12.00", isFeatured: true, isVegetarian: true, isVegan: true, sortOrder: 1 },
      { categoryId: breakfastId, name: "Acai Bowl", slug: "acai-bowl", description: "Thick acai blend, granola, banana, berries, honey.", price: "13.50", isVegetarian: true, isGlutenFree: true, sortOrder: 2 },
      { categoryId: breakfastId, name: "Egg & Cheese Sandwich", slug: "egg-cheese-sandwich", description: "Scrambled eggs, aged cheddar, everything bagel or brioche.", price: "9.50", isVegetarian: true, sortOrder: 3 },
      { categoryId: breakfastId, name: "Overnight Oats", slug: "overnight-oats", description: "Chia seeds, oat milk, seasonal fruit, maple syrup.", price: "8.00", isVegetarian: true, isVegan: true, isGlutenFree: true, sortOrder: 4 },
      // Lunch
      { categoryId: lunchId, name: "Grain Bowl", slug: "grain-bowl", description: "Quinoa, roasted veggies, feta, hummus, lemon tahini dressing.", price: "14.50", isFeatured: true, isVegetarian: true, isGlutenFree: true, sortOrder: 1 },
      { categoryId: lunchId, name: "Turkey Sandwich", slug: "turkey-sandwich", description: "Roast turkey, avocado, Swiss, arugula, whole grain mustard on sourdough.", price: "13.00", sortOrder: 2 },
      { categoryId: lunchId, name: "Caprese Panini", slug: "caprese-panini", description: "Fresh mozzarella, heirloom tomatoes, basil pesto, balsamic glaze.", price: "12.50", isVegetarian: true, sortOrder: 3 },
      { categoryId: lunchId, name: "Lentil Soup", slug: "lentil-soup", description: "Hearty red lentil with cumin, lemon, and herbs. Served with bread.", price: "9.00", isVegetarian: true, isVegan: true, isGlutenFree: true, sortOrder: 4 },
    ])
    .onConflictDoNothing()
    .returning();

  console.log(`Created ${items.length} menu items`);

  // Restaurant settings
  await db
    .insert(restaurantSettings)
    .values([
      { key: "cafe_name", value: "AnticCafe" },
      { key: "is_open", value: true },
      { key: "accepts_pickup", value: true },
      { key: "accepts_delivery", value: true },
      { key: "tax_rate", value: 0.0875 },
    ])
    .onConflictDoNothing();

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
