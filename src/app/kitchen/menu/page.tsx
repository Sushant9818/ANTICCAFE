import { db } from "@/db";
import { MenuAvailabilityList } from "@/components/admin/menu-availability-list";

export const dynamic = "force-dynamic";

export default async function KitchenMenuAvailabilityPage() {
  const [categoriesRaw, itemsRaw] = await Promise.all([
    db.menu_categories.findMany({ orderBy: { sort_order: "asc" } }),
    db.menu_items.findMany({
      include: { category: true },
      orderBy: [{ category: { sort_order: "asc" } }, { sort_order: "asc" }],
    }),
  ]);

  const categories = categoriesRaw.map((c) => ({ id: c.id, name: c.name }));
  const items = itemsRaw.map((i) => ({
    id: i.id,
    name: i.name,
    price: i.price.toString(),
    categoryId: i.category_id,
    categoryName: i.category.name,
    isAvailable: i.is_available,
  }));

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold text-white font-[family-name:var(--font-fraunces)] mb-2">
        Menu Availability
      </h1>
      <p className="text-stone-400 mb-6">Mark items unavailable as soon as you run out.</p>
      <MenuAvailabilityList initialItems={items} categories={categories} />
    </div>
  );
}
