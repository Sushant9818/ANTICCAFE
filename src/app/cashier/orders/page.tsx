import { db } from "@/db";
import { CashierOrdersList } from "@/components/admin/cashier-orders-list";

export const dynamic = "force-dynamic";

async function getOrders() {
  try {
    const [unpaidRaw, paidRaw] = await Promise.all([
      db.orders.findMany({
        where: { payment_status: { not: "paid" }, status: { not: "cancelled" }, order_type: { not: "dine_in" } },
        include: { items: true },
        orderBy: { created_at: "asc" },
        take: 100,
      }),
      db.orders.findMany({
        where: { payment_status: "paid", order_type: { not: "dine_in" } },
        include: { items: true },
        orderBy: { created_at: "desc" },
        take: 50,
      }),
    ]);

    const map = (o: (typeof unpaidRaw)[number]) => ({
      id: o.id,
      orderNumber: o.order_number,
      customerName: o.customer_name,
      orderType: o.order_type,
      status: o.status,
      paymentStatus: o.payment_status,
      paymentMethod: o.payment_method,
      subtotal: o.subtotal.toString(),
      tax: o.tax.toString(),
      discount: o.discount.toString(),
      deliveryFee: o.delivery_fee.toString(),
      tip: o.tip.toString(),
      total: o.total.toString(),
      promoCode: o.promo_code,
      refundRequested: o.refund_requested,
      createdAt: o.created_at,
      items: o.items.map((i) => ({
        id: i.id,
        itemName: i.item_name,
        itemPrice: i.item_price.toString(),
        quantity: i.quantity,
      })),
    });

    return { unpaid: unpaidRaw.map(map), paid: paidRaw.map(map) };
  } catch {
    return { unpaid: [], paid: [] };
  }
}

export default async function CashierOrdersPage() {
  const { unpaid, paid } = await getOrders();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold text-white font-[family-name:var(--font-fraunces)] mb-6">
        Orders
      </h1>
      <CashierOrdersList initialUnpaid={unpaid} initialPaid={paid} />
    </div>
  );
}
