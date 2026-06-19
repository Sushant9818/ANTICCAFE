import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { desc } from "drizzle-orm";
import { AdminOrdersBoard } from "@/components/admin/orders-board";

async function getOrders() {
  try {
    const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(100);
    const allItems = await db.select().from(orderItems);

    return allOrders.map((o) => ({
      ...o,
      items: allItems.filter((i) => i.orderId === o.id),
    }));
  } catch {
    return [];
  }
}

export default async function AdminOrdersPage() {
  const ordersList = await getOrders();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-stone-900 mb-6">Orders</h1>
      <AdminOrdersBoard initialOrders={ordersList} />
    </div>
  );
}
