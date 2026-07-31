import { db } from "@/db";

export async function getKitchenOrders() {
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
