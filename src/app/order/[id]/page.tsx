import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { CheckCircle, Clock, ChefHat, PackageCheck, Bike } from "lucide-react";
import { ORDER_STATUS_COLORS } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Status — AnticCafe",
};

const STATUS_STEPS = [
  { key: "pending", label: "Order Received", icon: CheckCircle },
  { key: "confirmed", label: "Confirmed", icon: Clock },
  { key: "preparing", label: "Preparing", icon: ChefHat },
  { key: "ready", label: "Ready", icon: PackageCheck },
  { key: "delivered", label: "Delivered", icon: Bike },
];

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let order;
  let orderItemsList;
  try {
    [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    if (!order) notFound();

    orderItemsList = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, id));
  } catch {
    notFound();
  }

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);

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
                  : (currentStepIndex / (STATUS_STEPS.length - 1)) * 100
              }%`,
            }}
          />
          {STATUS_STEPS.map((step, idx) => {
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
        <a href="tel:+15551234567" className="text-amber-700 hover:underline">
          (555) 123-4567
        </a>
      </p>
    </div>
  );
}
