import { db } from "@/db";
import { DeliveriesBoard } from "@/components/admin/deliveries-board";

export const dynamic = "force-dynamic";

async function getDeliveries() {
  try {
    const ordersRaw = await db.orders.findMany({
      where: { order_type: "delivery", status: { in: ["ready", "out_for_delivery"] } },
      include: { items: true },
      orderBy: { created_at: "asc" },
    });
    return ordersRaw.map((o) => ({
      id: o.id,
      orderNumber: o.order_number,
      customerName: o.customer_name,
      customerPhone: o.customer_phone,
      status: o.status,
      total: o.total.toString(),
      deliveryAddress: o.delivery_address,
      deliveryCity: o.delivery_city,
      deliveryState: o.delivery_state,
      deliveryZip: o.delivery_zip,
      specialInstructions: o.special_instructions,
      createdAt: o.created_at,
      items: o.items.map((i) => ({
        id: i.id,
        itemName: i.item_name,
        itemPrice: i.item_price.toString(),
        quantity: i.quantity,
      })),
    }));
  } catch {
    return [];
  }
}

export default async function DriverPage() {
  const deliveries = await getDeliveries();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold text-white font-[family-name:var(--font-fraunces)] mb-6">
        Deliveries
      </h1>
      <DeliveriesBoard initialDeliveries={deliveries} />
    </div>
  );
}
