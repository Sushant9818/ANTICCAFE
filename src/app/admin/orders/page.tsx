import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/db";
import { AdminOrdersBoard } from "@/components/admin/orders-board";

export const dynamic = "force-dynamic";

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
      refundRequested: o.refund_requested,
      refundReason: o.refund_reason,
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold text-white font-[family-name:var(--font-fraunces)]">
          Orders
        </h1>
        <Link
          href="/admin/orders/new"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-admin-amber text-white text-sm font-medium hover:bg-admin-amber/90"
        >
          <Plus className="h-4 w-4" /> New Order
        </Link>
      </div>
      <AdminOrdersBoard initialOrders={ordersList} />
    </div>
  );
}
