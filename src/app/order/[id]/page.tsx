import { db } from "@/db";
import { notFound } from "next/navigation";
import { CheckCircle, Clock, ChefHat, PackageCheck, Bike, PartyPopper } from "lucide-react";
import { ORDER_STATUS_COLORS, CAFE_PHONE } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Status — AnticCafe",
};

function getStatusSteps(orderType: string) {
  const base = [
    { key: "pending", label: "Order Received", icon: CheckCircle },
    { key: "confirmed", label: "Confirmed", icon: Clock },
    { key: "preparing", label: "Preparing", icon: ChefHat },
    { key: "ready", label: "Ready", icon: PackageCheck },
  ];
  if (orderType === "delivery") {
    return [
      ...base,
      { key: "out_for_delivery", label: "Out for Delivery", icon: Bike },
      { key: "delivered", label: "Delivered", icon: PartyPopper },
    ];
  }
  return [...base, { key: "delivered", label: "Picked Up", icon: PartyPopper }];
}

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let order;
  let orderItemsList;
  try {
    const orderRaw = await db.orders.findUnique({
      where: { id },
    });

    if (!orderRaw) notFound();

    order = {
      id: orderRaw.id,
      orderNumber: orderRaw.order_number,
      customerId: orderRaw.customer_id,
      customerName: orderRaw.customer_name,
      customerEmail: orderRaw.customer_email,
      customerPhone: orderRaw.customer_phone,
      orderType: orderRaw.order_type,
      status: orderRaw.status,
      paymentStatus: orderRaw.payment_status,
      paymentMethod: orderRaw.payment_method,
      subtotal: orderRaw.subtotal.toString(),
      tax: orderRaw.tax.toString(),
      tip: orderRaw.tip.toString(),
      deliveryFee: orderRaw.delivery_fee.toString(),
      discount: orderRaw.discount.toString(),
      total: orderRaw.total.toString(),
      promoCode: orderRaw.promo_code,
      stripePaymentIntentId: orderRaw.stripe_payment_intent_id,
      stripeCheckoutSessionId: orderRaw.stripe_checkout_session_id,
      deliveryAddress: orderRaw.delivery_address,
      deliveryCity: orderRaw.delivery_city,
      deliveryState: orderRaw.delivery_state,
      deliveryZip: orderRaw.delivery_zip,
      specialInstructions: orderRaw.special_instructions,
      accessToken: orderRaw.access_token,
      scheduledFor: orderRaw.scheduled_for,
      estimatedReadyAt: orderRaw.estimated_ready_at,
      createdAt: orderRaw.created_at,
      updatedAt: orderRaw.updated_at,
    };

    const itemsRaw = await db.order_items.findMany({
      where: { order_id: id },
    });
    orderItemsList = itemsRaw.map((i) => ({
      id: i.id,
      orderId: i.order_id,
      menuItemId: i.menu_item_id,
      itemName: i.item_name,
      itemPrice: i.item_price.toString(),
      quantity: i.quantity,
      specialInstructions: i.special_instructions,
      createdAt: i.created_at,
    }));
  } catch {
    notFound();
  }

  const statusSteps = getStatusSteps(order.orderType);
  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <div className="text-center mb-8">
        <CheckCircle className="h-14 w-14 text-green-500 mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-stone-900">
          Order #{order.orderNumber}
        </h1>
        <p className="text-stone-500 mt-1">
          Thank you, {order.customerName}!
        </p>
        <span
          className={`inline-block mt-3 px-3 py-1 rounded-full text-sm font-medium ${
            ORDER_STATUS_COLORS[order.status] ?? "bg-stone-100 text-stone-700"
          }`}
        >
          {order.status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
        </span>
        {order.estimatedReadyAt && (order.status === "confirmed" || order.status === "preparing") && (
          <p className="text-sm text-amber-700 font-medium mt-2">
            Estimated ready by{" "}
            {new Date(order.estimatedReadyAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
        {order.paymentMethod === "cash" && (
          <p className="text-sm text-amber-700 font-medium mt-2">
            Pay with cash when you pick up your order
          </p>
        )}
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-5 left-8 right-8 h-0.5 bg-stone-200" />
          <div
            className="absolute top-5 left-8 h-0.5 bg-amber-500 transition-all duration-500"
            style={{
              width: `${
                currentStepIndex <= 0
                  ? 0
                  : (currentStepIndex / (statusSteps.length - 1)) * 100
              }%`,
            }}
          />
          {statusSteps.map((step, idx) => {
            const Icon = step.icon;
            const done = idx <= currentStepIndex;
            return (
              <div key={step.key} className="flex flex-col items-center z-10 gap-2">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    done
                      ? "bg-amber-700 border-amber-700 text-white"
                      : "bg-white border-stone-200 text-stone-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <p className={`text-[10px] font-medium text-center leading-tight ${done ? "text-stone-800" : "text-stone-400"}`}>
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order details */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6">
        <h2 className="font-semibold text-stone-900 mb-4">Order Details</h2>
        <div className="space-y-3">
          {orderItemsList.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-stone-700">
                {item.itemName} × {item.quantity}
              </span>
              <span className="text-stone-900 font-medium">
                {formatPrice(Number(item.itemPrice) * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-stone-200 mt-4 pt-4 space-y-1 text-sm">
          <div className="flex justify-between text-stone-600">
            <span>Subtotal</span>
            <span>{formatPrice(Number(order.subtotal))}</span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>Tax</span>
            <span>{formatPrice(Number(order.tax))}</span>
          </div>
          {Number(order.tip) > 0 && (
            <div className="flex justify-between text-stone-600">
              <span>Tip</span>
              <span>{formatPrice(Number(order.tip))}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-stone-900 border-t border-stone-200 pt-2 mt-2">
            <span>Total</span>
            <span>{formatPrice(Number(order.total))}</span>
          </div>
        </div>
      </div>

      {order.orderType === "delivery" && order.deliveryAddress && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="font-semibold text-stone-900 mb-2">Delivery To</h2>
          <p className="text-sm text-stone-600">
            {order.deliveryAddress}, {order.deliveryCity}, {order.deliveryState} {order.deliveryZip}
          </p>
        </div>
      )}

      <p className="text-center text-sm text-stone-400 mt-6">
        Questions? Call us at{" "}
        <a href={`tel:${CAFE_PHONE.replace(/[^+\d]/g, "")}`} className="text-amber-700 hover:underline">
          {CAFE_PHONE}
        </a>
      </p>
    </div>
  );
}
