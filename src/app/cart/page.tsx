"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { TAX_RATE, DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, updateQuantity, removeItem, orderType, setOrderType } = useCart();
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const delivery = orderType === "delivery" && subtotal < FREE_DELIVERY_THRESHOLD ? DELIVERY_FEE : 0;
  const total = subtotal + tax + delivery;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <ShoppingBag className="h-16 w-16 text-stone-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-stone-900 mb-2">Your cart is empty</h1>
        <p className="text-stone-500 mb-6">Add something delicious from our menu!</p>
        <Link href="/menu">
          <Button className="bg-amber-700 hover:bg-amber-800 text-white rounded-full px-6">
            Browse Menu
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <h1 className="text-3xl font-bold text-stone-900 mb-8">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Order type toggle */}
          <div className="flex gap-2 p-1 bg-stone-100 rounded-full w-fit mb-6">
            {(["pickup", "delivery"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                className={`px-5 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
                  orderType === type
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-700"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-stone-200"
            >
              <div className="h-16 w-16 rounded-xl bg-stone-100 flex items-center justify-center shrink-0 overflow-hidden">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl">☕</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-stone-900 truncate">{item.name}</p>
                <p className="text-sm text-amber-700">{formatPrice(item.price)}</p>
                {item.specialInstructions && (
                  <p className="text-xs text-stone-400 mt-0.5">{item.specialInstructions}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="h-7 w-7 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-100 transition-colors"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="h-7 w-7 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-100 transition-colors"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              <p className="text-sm font-semibold text-stone-900 w-14 text-right">
                {formatPrice(item.price * item.quantity)}
              </p>

              <button
                onClick={() => removeItem(item.id)}
                className="text-stone-400 hover:text-red-500 transition-colors ml-1"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div>
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sticky top-24">
            <h2 className="font-semibold text-stone-900 mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Tax (8.75%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              {orderType === "delivery" && (
                <div className="flex justify-between text-stone-600">
                  <span>Delivery fee</span>
                  <span>
                    {delivery === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      formatPrice(delivery)
                    )}
                  </span>
                </div>
              )}
              <div className="border-t border-stone-200 pt-2 mt-2 flex justify-between font-semibold text-stone-900">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            {orderType === "delivery" && subtotal < FREE_DELIVERY_THRESHOLD && (
              <p className="text-xs text-stone-500 mt-3">
                Add {formatPrice(FREE_DELIVERY_THRESHOLD - subtotal)} more for free delivery
              </p>
            )}

            <Link href="/checkout" className="block mt-5">
              <Button className="w-full bg-amber-700 hover:bg-amber-800 text-white rounded-full">
                Proceed to Checkout
              </Button>
            </Link>

            <Link href="/menu" className="block mt-3 text-center text-sm text-stone-500 hover:text-stone-700 transition-colors">
              ← Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
