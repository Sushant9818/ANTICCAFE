import { db } from "@/db";
import { menuItems, menuCategories } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { AdminMenuManager } from "@/components/admin/menu-manager";

async function getMenuData() {
  try {
    const [categories, items] = await Promise.all([
      db.select().from(menuCategories).orderBy(asc(menuCategories.sortOrder)),
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
          categoryName: menuCategories.name,
        })
        .from(menuItems)
        .innerJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
        .orderBy(asc(menuCategories.sortOrder), asc(menuItems.sortOrder)),
    ]);
    return { categories, items };
  } catch {
    return { categories: [], items: [] };
  }
}

export default async function AdminMenuPage() {
  const { categories, items } = await getMenuData();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-stone-900 mb-6">Menu Management</h1>
      <AdminMenuManager initialCategories={categories} initialItems={items} />
    </div>
  );
}
