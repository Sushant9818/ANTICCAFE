import { db } from "@/db";
import { KitchenBoard } from "@/components/admin/kitchen-board";

async function getPendingOrders() {
  try {
    const ordersRaw = await db.orders.findMany({
      where: { status: "pending" },
      include: { items: true },
      orderBy: { created_at: "asc" },
      take: 100,
    });
    return ordersRaw.map((o) => ({
      id: o.id,
      orderNumber: o.order_number,
      customerName: o.customer_name,
      customerPhone: o.customer_phone,
      orderType: o.order_type,
      total: o.total.toString(),
      specialInstructions: o.special_instructions,
      deliveryAddress: o.delivery_address,
      deliveryCity: o.delivery_city,
      createdAt: o.created_at,
      items: o.items.map((i) => ({
        id: i.id,
        itemName: i.item_name,
        itemPrice: i.item_price.toString(),
        quantity: i.quantity,
        specialInstructions: i.special_instructions,
      })),
    }));
  } catch {
    return [];
  }
}

export default async function AdminKitchenPage() {
  const ordersList = await getPendingOrders();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-stone-900 mb-6">Kitchen</h1>
      <KitchenBoard initialOrders={ordersList} />
    </div>
  );
}
