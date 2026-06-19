import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { db } from "@/db";
import { menuItems, menuCategories } from "@/db/schema";
import { eq, and } from "drizzle-orm";

async function getFeaturedItems() {
  try {
    return await db
      .select({
        id: menuItems.id,
        name: menuItems.name,
        description: menuItems.description,
        price: menuItems.price,
        imageUrl: menuItems.imageUrl,
        categoryName: menuCategories.name,
      })
      .from(menuItems)
      .innerJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
      .where(and(eq(menuItems.isFeatured, true), eq(menuItems.isAvailable, true)))
      .limit(6);
  } catch {
    return [];
  }
}

export async function Featured() {
  const items = await getFeaturedItems();

  const fallback = [
    {
      id: "1",
      name: "Signature Latte",
      description: "Our house-crafted espresso with silky steamed milk and a touch of vanilla.",
      price: "5.50",
      imageUrl: null,
      categoryName: "Coffee",
    },
    {
      id: "2",
      name: "Avocado Toast",
      description: "Sourdough, smashed avocado, cherry tomatoes, microgreens, everything bagel spice.",
      price: "12.00",
      imageUrl: null,
      categoryName: "Breakfast",
    },
    {
      id: "3",
      name: "Almond Croissant",
      description: "Buttery, flaky croissant filled with rich almond cream and toasted almonds.",
      price: "4.75",
      imageUrl: null,
      categoryName: "Pastries",
    },
    {
      id: "4",
      name: "Matcha Latte",
      description: "Ceremonial grade matcha whisked with oat milk and a hint of honey.",
      price: "6.00",
      imageUrl: null,
      categoryName: "Drinks",
    },
    {
      id: "5",
      name: "Grain Bowl",
      description: "Quinoa, roasted veggies, feta, hummus, lemon tahini dressing.",
      price: "14.50",
      imageUrl: null,
      categoryName: "Lunch",
    },
    {
      id: "6",
      name: "Cold Brew",
      description: "18-hour steeped, smooth and rich. Served over ice with your choice of milk.",
      price: "5.00",
      imageUrl: null,
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
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
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
