import { notFound } from "next/navigation";
import { db } from "@/db";
import { ReceiptView } from "@/components/admin/receipt-view";

export const dynamic = "force-dynamic";

export default async function CashierReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await db.orders.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) notFound();

  return (
    <ReceiptView
      order={{
        orderNumber: order.order_number,
        customerName: order.customer_name,
        orderType: order.order_type,
        paymentStatus: order.payment_status,
        paymentMethod: order.payment_method,
        subtotal: order.subtotal.toString(),
        tax: order.tax.toString(),
        discount: order.discount.toString(),
        deliveryFee: order.delivery_fee.toString(),
        tip: order.tip.toString(),
        total: order.total.toString(),
        promoCode: order.promo_code,
        createdAt: order.created_at,
        items: order.items.map((i) => ({
          id: i.id,
          itemName: i.item_name,
          itemPrice: i.item_price.toString(),
          quantity: i.quantity,
        })),
      }}
    />
  );
}
