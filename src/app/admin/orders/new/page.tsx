import { db } from "@/db";
import { NewOrderForm } from "@/components/admin/new-order-form";

export const dynamic = "force-dynamic";

export default async function NewOrderPage() {
  const menuItems = await db.menu_items.findMany({
    where: { is_available: true },
    include: { category: true },
    orderBy: [{ category: { sort_order: "asc" } }, { sort_order: "asc" }],
  });

  const categories = Array.from(
    new Map(menuItems.map((i) => [i.category.id, i.category])).values()
  )
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="p-8">
      <NewOrderForm
        menuItems={menuItems.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price.toString(),
          categoryId: i.category_id,
          categoryName: i.category.name,
          description: i.description,
          imageUrl: i.image_url,
          isVegetarian: i.is_vegetarian,
          isVegan: i.is_vegan,
          isGlutenFree: i.is_gluten_free,
        }))}
        categories={categories}
      />
    </div>
  );
}
