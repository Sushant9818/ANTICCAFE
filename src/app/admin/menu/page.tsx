import { db } from "@/db";
import { AdminMenuManager } from "@/components/admin/menu-manager";

async function getMenuData() {
  try {
    const [categoriesRaw, itemsWithCategory] = await Promise.all([
      db.menu_categories.findMany({
        orderBy: { sort_order: "asc" },
      }),
      db.menu_items.findMany({
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

    const items = itemsWithCategory.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      description: item.description,
      price: item.price.toString(),
      categoryId: item.category_id,
      imageUrl: item.image_url,
      isAvailable: item.is_available,
      isVegetarian: item.is_vegetarian,
      isVegan: item.is_vegan,
      isGlutenFree: item.is_gluten_free,
      isFeatured: item.is_featured,
      sortOrder: item.sort_order,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      categoryName: item.category.name,
    }));

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
