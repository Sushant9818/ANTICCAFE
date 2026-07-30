import { db } from "@/db";
import { MenuGrid } from "@/components/menu/menu-grid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menu — AnticCafe",
  description: "Browse our full menu of artisan coffee, pastries, and meals.",
};

async function getMenuData() {
  try {
    const [categoriesRaw, itemsRaw] = await Promise.all([
      db.menu_categories.findMany({
        where: { is_active: true },
        orderBy: { sort_order: "asc" },
      }),
      db.menu_items.findMany({
        where: { is_available: true },
        include: { category: true },
        orderBy: [{ category: { sort_order: "asc" } }, { sort_order: "asc" }],
      }),
    ]);
    const categories = categoriesRaw.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      sortOrder: c.sort_order,
      isActive: c.is_active,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    }));
    const items = itemsRaw.map((i) => ({
      id: i.id,
      name: i.name,
      slug: i.slug,
      description: i.description,
      price: i.price.toString(),
      categoryId: i.category_id,
      imageUrl: i.image_url,
      isAvailable: i.is_available,
      isVegetarian: i.is_vegetarian,
      isVegan: i.is_vegan,
      isGlutenFree: i.is_gluten_free,
      isFeatured: i.is_featured,
      sortOrder: i.sort_order,
      createdAt: i.created_at,
      updatedAt: i.updated_at,
      category: {
        id: i.category.id,
        name: i.category.name,
        slug: i.category.slug,
        description: i.category.description,
        sortOrder: i.category.sort_order,
        isActive: i.category.is_active,
        createdAt: i.category.created_at,
        updatedAt: i.category.updated_at,
      },
    }));
    return { categories, items };
  } catch {
    return { categories: [], items: [] };
  }
}

export default async function MenuPage() {
  const { categories, items } = await getMenuData();

  return (
    <div className="bg-stone-950 min-h-screen">
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Our Menu</h1>
          <p className="text-stone-300">
            Everything made fresh, every day. Order online for pickup or delivery.
          </p>
        </div>
        <MenuGrid categories={categories} items={items} />
      </div>
    </div>
  );
}
