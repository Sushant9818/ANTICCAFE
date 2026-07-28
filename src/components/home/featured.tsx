import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { db } from "@/db";

async function getFeaturedItems() {
  try {
    const items = await db.menu_items.findMany({
      where: {
        is_featured: true,
        is_available: true,
      },
      include: { category: true },
      take: 6,
    });
    return items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      image_url: item.image_url,
      categoryName: item.category.name,
    }));
  } catch {
    return [];
  }
}

export async function Featured() {
  const items = await getFeaturedItems();

  const fallback = [
    {
      id: "1",
      category_id: "coffee",
      name: "Signature Latte",
      slug: "signature-latte",
      description: "Our house-crafted espresso with silky steamed milk and a touch of vanilla.",
      price: "5.50",
      image_url: null,
      is_available: true,
      is_vegetarian: true,
      is_vegan: false,
      is_gluten_free: false,
      is_featured: true,
      sort_order: 1,
      created_at: new Date(),
      updated_at: new Date(),
      category: { id: "coffee", name: "Coffee", slug: "coffee", description: null, sort_order: 1, is_active: true, created_at: new Date(), updated_at: new Date() },
      categoryName: "Coffee",
    },
    {
      id: "2",
      category_id: "breakfast",
      name: "Avocado Toast",
      slug: "avocado-toast",
      description: "Sourdough, smashed avocado, cherry tomatoes, microgreens, everything bagel spice.",
      price: "12.00",
      image_url: null,
      is_available: true,
      is_vegetarian: true,
      is_vegan: true,
      is_gluten_free: false,
      is_featured: true,
      sort_order: 1,
      created_at: new Date(),
      updated_at: new Date(),
      category: { id: "breakfast", name: "Breakfast", slug: "breakfast", description: null, sort_order: 4, is_active: true, created_at: new Date(), updated_at: new Date() },
      categoryName: "Breakfast",
    },
    {
      id: "3",
      category_id: "pastries",
      name: "Almond Croissant",
      slug: "almond-croissant",
      description: "Buttery, flaky croissant filled with rich almond cream and toasted almonds.",
      price: "4.75",
      image_url: null,
      is_available: true,
      is_vegetarian: true,
      is_vegan: false,
      is_gluten_free: false,
      is_featured: true,
      sort_order: 1,
      created_at: new Date(),
      updated_at: new Date(),
      category: { id: "pastries", name: "Pastries", slug: "pastries", description: null, sort_order: 3, is_active: true, created_at: new Date(), updated_at: new Date() },
      categoryName: "Pastries",
    },
    {
      id: "4",
      category_id: "tea",
      name: "Matcha Latte",
      slug: "matcha-latte",
      description: "Ceremonial grade matcha whisked with oat milk and a hint of honey.",
      price: "6.00",
      image_url: null,
      is_available: true,
      is_vegetarian: true,
      is_vegan: false,
      is_gluten_free: false,
      is_featured: true,
      sort_order: 1,
      created_at: new Date(),
      updated_at: new Date(),
      category: { id: "tea", name: "Drinks", slug: "tea-drinks", description: null, sort_order: 2, is_active: true, created_at: new Date(), updated_at: new Date() },
      categoryName: "Drinks",
    },
    {
      id: "5",
      category_id: "lunch",
      name: "Grain Bowl",
      slug: "grain-bowl",
      description: "Quinoa, roasted veggies, feta, hummus, lemon tahini dressing.",
      price: "14.50",
      image_url: null,
      is_available: true,
      is_vegetarian: true,
      is_vegan: false,
      is_gluten_free: true,
      is_featured: true,
      sort_order: 1,
      created_at: new Date(),
      updated_at: new Date(),
      category: { id: "lunch", name: "Lunch", slug: "lunch", description: null, sort_order: 5, is_active: true, created_at: new Date(), updated_at: new Date() },
      categoryName: "Lunch",
    },
    {
      id: "6",
      category_id: "coffee",
      name: "Cold Brew",
      slug: "cold-brew",
      description: "18-hour steeped, smooth and rich. Served over ice with your choice of milk.",
      price: "5.00",
      image_url: null,
      is_available: true,
      is_vegetarian: true,
      is_vegan: true,
      is_gluten_free: false,
      is_featured: true,
      sort_order: 1,
      created_at: new Date(),
      updated_at: new Date(),
      category: { id: "coffee", name: "Coffee", slug: "coffee", description: null, sort_order: 1, is_active: true, created_at: new Date(), updated_at: new Date() },
      categoryName: "Coffee",
    },
  ];

  const displayItems = items.length > 0 ? items : fallback;

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-sm font-medium text-amber-700 uppercase tracking-wider mb-2">
              Fan Favorites
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900">
              What people love
            </h2>
          </div>
          <Link
            href="/menu"
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-amber-700 hover:text-amber-800 transition-colors"
          >
            Full Menu <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayItems.map((item) => (
            <Link
              key={item.id}
              href="/menu"
              className="group rounded-2xl border border-stone-200 overflow-hidden hover:shadow-md transition-shadow bg-white"
            >
              <div className="h-44 bg-stone-100 flex items-center justify-center overflow-hidden">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="text-5xl">☕</div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-stone-900 group-hover:text-amber-700 transition-colors">
                    {item.name}
                  </h3>
                  <span className="text-sm font-bold text-amber-700 whitespace-nowrap">
                    {formatPrice(Number(item.price))}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mb-2">{item.categoryName}</p>
                {item.description && (
                  <p className="text-sm text-stone-600 line-clamp-2">{item.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/menu"
            className="inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:text-amber-800 transition-colors"
          >
            View Full Menu <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
