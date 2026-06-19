import { db } from "@/db";
import { menuItems, menuCategories } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { MenuGrid } from "@/components/menu/menu-grid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menu — AnticCafe",
  description: "Browse our full menu of artisan coffee, pastries, and meals.",
};

async function getMenuData() {
  try {
    const [categories, items] = await Promise.all([
      db
        .select()
        .from(menuCategories)
        .where(eq(menuCategories.isActive, true))
        .orderBy(asc(menuCategories.sortOrder)),
      db
        .select({
          id: menuItems.id,
          categoryId: menuItems.categoryId,
          name: menuItems.name,
          slug: menuItems.slug,
          description: menuItems.description,
          price: menuItems.price,
          imageUrl: menuItems.imageUrl,
          isAvailable: menuItems.isAvailable,
          isVegetarian: menuItems.isVegetarian,
          isVegan: menuItems.isVegan,
          isGlutenFree: menuItems.isGlutenFree,
          isFeatured: menuItems.isFeatured,
          sortOrder: menuItems.sortOrder,
          createdAt: menuItems.createdAt,
          updatedAt: menuItems.updatedAt,
          category: {
            id: menuCategories.id,
            name: menuCategories.name,
            slug: menuCategories.slug,
            description: menuCategories.description,
            sortOrder: menuCategories.sortOrder,
            isActive: menuCategories.isActive,
            createdAt: menuCategories.createdAt,
            updatedAt: menuCategories.updatedAt,
          },
        })
        .from(menuItems)
        .innerJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
        .where(eq(menuItems.isAvailable, true))
        .orderBy(asc(menuCategories.sortOrder), asc(menuItems.sortOrder)),
    ]);
    return { categories, items };
  } catch {
    return { categories: [], items: [] };
  }
}

export default async function MenuPage() {
  const { categories, items } = await getMenuData();

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-stone-900 mb-2">Our Menu</h1>
        <p className="text-stone-600">
          Everything made fresh, every day. Order online for pickup or delivery.
        </p>
      </div>
      <MenuGrid categories={categories} items={items} />
    </div>
  );
}
