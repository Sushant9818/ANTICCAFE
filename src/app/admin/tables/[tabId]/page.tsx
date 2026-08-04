import { notFound } from "next/navigation";
import { db } from "@/db";
import { TabDetail } from "@/components/admin/tab-detail";

export const dynamic = "force-dynamic";

export default async function TabDetailPage({
  params,
}: {
  params: Promise<{ tabId: string }>;
}) {
  const { tabId } = await params;

  const tab = await db.dine_in_tabs.findUnique({
    where: { id: tabId },
    include: {
      table: true,
      orders: {
        include: { items: true },
        orderBy: { created_at: "asc" },
      },
    },
  });

  if (!tab) notFound();

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
      <TabDetail
        tab={{
          id: tab.id,
          status: tab.status,
          tableNumber: tab.table.number,
          serverName: tab.server_name,
          rounds: tab.orders.map((o) => ({
            id: o.id,
            status: o.status,
            total: o.total.toString(),
            createdAt: o.created_at,
            items: o.items.map((i) => ({
              id: i.id,
              itemName: i.item_name,
              itemPrice: i.item_price.toString(),
              quantity: i.quantity,
            })),
          })),
        }}
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
