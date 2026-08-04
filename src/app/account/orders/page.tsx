import { db } from "@/db";
import { getCurrentCustomer } from "@/lib/customer";
import { OrdersList } from "@/components/account/orders-list";

export const dynamic = "force-dynamic";

export default async function AccountOrdersPage() {
  const customer = await getCurrentCustomer();

  const [ordersRaw, reviewsRaw] = customer
    ? await Promise.all([
        db.orders.findMany({
          where: { customer_id: customer.id },
          include: { items: true },
          orderBy: { created_at: "desc" },
        }),
        db.reviews.findMany({ where: { customer_id: customer.id } }),
      ])
    : [[], []];

  const orders = ordersRaw.map((o) => ({
    id: o.id,
    orderNumber: o.order_number,
    orderType: o.order_type,
    status: o.status,
    total: o.total.toString(),
    createdAt: o.created_at,
    items: o.items.map((i) => ({
      id: i.id,
      menuItemId: i.menu_item_id,
      itemName: i.item_name,
      itemPrice: i.item_price.toString(),
      quantity: i.quantity,
    })),
  }));

  const reviewedItemIds = new Set(reviewsRaw.map((r) => r.menu_item_id));

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="text-3xl font-bold text-white mb-2">My Orders</h1>
      <p className="text-stone-400 mb-8">Track, cancel, and review your past orders.</p>
      <OrdersList orders={orders} reviewedItemIds={[...reviewedItemIds]} />
    </div>
  );
}
