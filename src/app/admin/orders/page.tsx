import { db } from "@/db";
import { AdminOrdersBoard } from "@/components/admin/orders-board";

async function getOrders() {
  try {
    const ordersRaw = await db.orders.findMany({
      include: { items: true },
      orderBy: { created_at: "desc" },
      take: 100,
    });
    return ordersRaw.map((o) => ({
      id: o.id,
      orderNumber: o.order_number,
      customerId: o.customer_id,
      customerName: o.customer_name,
      customerEmail: o.customer_email,
      customerPhone: o.customer_phone,
      orderType: o.order_type,
      status: o.status,
      paymentStatus: o.payment_status,
      paymentMethod: o.payment_method,
      subtotal: o.subtotal.toString(),
      tax: o.tax.toString(),
      tip: o.tip.toString(),
      deliveryFee: o.delivery_fee.toString(),
      discount: o.discount.toString(),
      total: o.total.toString(),
      promoCode: o.promo_code,
      stripePaymentIntentId: o.stripe_payment_intent_id,
      stripeCheckoutSessionId: o.stripe_checkout_session_id,
      deliveryAddress: o.delivery_address,
      deliveryCity: o.delivery_city,
      deliveryState: o.delivery_state,
      deliveryZip: o.delivery_zip,
      specialInstructions: o.special_instructions,
      accessToken: o.access_token,
      scheduledFor: o.scheduled_for,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
      items: o.items.map((i) => ({
        id: i.id,
        orderId: i.order_id,
        menuItemId: i.menu_item_id,
        itemName: i.item_name,
        itemPrice: i.item_price.toString(),
        quantity: i.quantity,
        specialInstructions: i.special_instructions,
        createdAt: i.created_at,
      })),
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
