"use client";

import { Printer } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type OrderItem = { id: string; itemName: string; itemPrice: string; quantity: number };

type Order = {
  orderNumber: number;
  customerName: string;
  orderType: string;
  paymentStatus: string;
  paymentMethod: string | null;
  subtotal: string;
  tax: string;
  discount: string;
  deliveryFee: string;
  tip: string;
  total: string;
  promoCode: string | null;
  createdAt: Date;
  items: OrderItem[];
};

export function ReceiptView({ order }: { order: Order }) {
  return (
    <div className="p-8 flex flex-col items-center print:p-0">
      <button
        onClick={() => window.print()}
        className="print:hidden mb-6 flex items-center gap-2 px-4 py-2 rounded-full bg-admin-amber text-white text-sm font-semibold hover:bg-admin-amber/90"
      >
        <Printer className="h-4 w-4" /> Print Receipt
      </button>

      <div className="bg-white text-stone-900 rounded-xl border border-stone-200 p-8 w-full max-w-sm print:border-0 print:rounded-none print:shadow-none">
        <div className="text-center mb-6">
          <p className="font-[family-name:var(--font-fraunces)] text-2xl font-semibold">AnticCafe</p>
          <p className="text-xs text-stone-500 mt-1">
            {new Date(order.createdAt).toLocaleString([], {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>

        <div className="border-t border-dashed border-stone-300 pt-3 mb-3 text-sm">
          <div className="flex justify-between">
            <span className="text-stone-500">Order</span>
            <span className="font-[family-name:var(--font-plex-mono)]">#{order.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Customer</span>
            <span>{order.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Type</span>
            <span className="capitalize">{order.orderType.replace(/_/g, " ")}</span>
          </div>
        </div>

        <div className="border-t border-dashed border-stone-300 pt-3 mb-3 space-y-1">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.itemName} × {item.quantity}
              </span>
              <span className="font-[family-name:var(--font-plex-mono)]">
                {formatPrice(Number(item.itemPrice) * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-dashed border-stone-300 pt-3 space-y-1 text-sm font-[family-name:var(--font-plex-mono)]">
          <div className="flex justify-between text-stone-600">
            <span className="font-sans">Subtotal</span>
            <span>{formatPrice(Number(order.subtotal))}</span>
          </div>
          {Number(order.discount) > 0 && (
            <div className="flex justify-between text-green-700">
              <span className="font-sans">Discount {order.promoCode ? `(${order.promoCode})` : ""}</span>
              <span>-{formatPrice(Number(order.discount))}</span>
            </div>
          )}
          <div className="flex justify-between text-stone-600">
            <span className="font-sans">Tax</span>
            <span>{formatPrice(Number(order.tax))}</span>
          </div>
          {Number(order.deliveryFee) > 0 && (
            <div className="flex justify-between text-stone-600">
              <span className="font-sans">Delivery</span>
              <span>{formatPrice(Number(order.deliveryFee))}</span>
            </div>
          )}
          {Number(order.tip) > 0 && (
            <div className="flex justify-between text-stone-600">
              <span className="font-sans">Tip</span>
              <span>{formatPrice(Number(order.tip))}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-stone-900 text-base pt-2 border-t border-dashed border-stone-300">
            <span className="font-sans">Total</span>
            <span>{formatPrice(Number(order.total))}</span>
          </div>
        </div>

        <div className="border-t border-dashed border-stone-300 mt-4 pt-3 text-center text-xs text-stone-500 capitalize">
          {order.paymentStatus === "paid"
            ? `Paid via ${order.paymentMethod ?? "—"}`
            : "Payment pending"}
        </div>

        <p className="text-center text-xs text-stone-400 mt-4">Thank you for visiting AnticCafe!</p>
      </div>
    </div>
  );
}
