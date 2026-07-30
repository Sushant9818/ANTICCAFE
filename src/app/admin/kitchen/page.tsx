import { db } from "@/db";
import { KitchenBoard } from "@/components/admin/kitchen-board";

async function getKitchenOrders() {
  try {
    const ordersRaw = await db.orders.findMany({
      where: { status: { in: ["pending", "confirmed", "preparing"] } },
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
      status: o.status,
      total: o.total.toString(),
      specialInstructions: o.special_instructions,
      deliveryAddress: o.delivery_address,
      deliveryCity: o.delivery_city,
      createdAt: o.created_at,
      estimatedReadyAt: o.estimated_ready_at,
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
  const ordersList = await getKitchenOrders();

  return (
    <div className="relative overflow-hidden bg-stone-950 min-h-screen">
      <div className="absolute inset-0 bg-[url('/images/hero-bg.png')] bg-no-repeat bg-center bg-[length:auto_70%] opacity-[0.06]" />
      <div className="relative p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Kitchen</h1>
        <KitchenBoard initialOrders={ordersList} />
      </div>
    </div>
  );
}
