"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { TAX_RATE, DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

const TIP_OPTIONS = [0, 10, 15, 20, 25];

function submitEsewaForm(esewaForm: { url: string; fields: Record<string, string> }) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = esewaForm.url;

  for (const [name, value] of Object.entries(esewaForm.fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, orderType, total: getSubtotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [tipPercent, setTipPercent] = useState(15);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    deliveryAddress: "",
    deliveryCity: "",
    deliveryState: "",
    deliveryZip: "",
    specialInstructions: "",
    promoCode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash" | "esewa" | "khalti">("card");
  const [promoInput, setPromoInput] = useState("");
  const [promoApplying, setPromoApplying] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountAmount: number } | null>(null);

  const subtotal = getSubtotal();
  const discount = appliedPromo?.discountAmount ?? 0;
  const discountedSubtotal = subtotal - discount;
  const tax = discountedSubtotal * TAX_RATE;
  const delivery = orderType === "delivery" && subtotal < FREE_DELIVERY_THRESHOLD ? DELIVERY_FEE : 0;
  const tip = (subtotal * tipPercent) / 100;
  const total = discountedSubtotal + tax + delivery + tip;

  const applyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoApplying(true);
    setPromoError(null);
    try {
      const res = await fetch("/api/checkout/validate-promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoInput, subtotal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid promo code");
      setAppliedPromo({ code: data.code, discountAmount: data.discountAmount });
      setForm((f) => ({ ...f, promoCode: data.code }));
      toast.success(`Promo code ${data.code} applied`);
    } catch (err) {
      setAppliedPromo(null);
      setForm((f) => ({ ...f, promoCode: "" }));
      setPromoError(err instanceof Error ? err.message : "Invalid promo code");
    } finally {
      setPromoApplying(false);
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoInput("");
    setPromoError(null);
    setForm((f) => ({ ...f, promoCode: "" }));
  };

  const orderPlacedRef = useRef(false);

  useEffect(() => {
    if (items.length === 0 && !orderPlacedRef.current) router.push("/cart");
  }, [items.length, router]);

  useEffect(() => {
    if (orderType !== "pickup" && paymentMethod === "cash") setPaymentMethod("card");
  }, [orderType, paymentMethod]);

  if (items.length === 0) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast.error("Please fill in your name and phone number.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          orderType,
          paymentMethod,
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone,
          deliveryAddress: form.deliveryAddress,
          deliveryCity: form.deliveryCity,
          deliveryState: form.deliveryState,
          deliveryZip: form.deliveryZip,
          specialInstructions: form.specialInstructions,
          promoCode: form.promoCode,
          tip: tip.toFixed(2),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");

      if (data.esewaForm) {
        orderPlacedRef.current = true;
        clearCart();
        submitEsewaForm(data.esewaForm);
      } else if (data.url) {
        orderPlacedRef.current = true;
        clearCart();
        router.push(data.url);
      } else if (data.orderId) {
        orderPlacedRef.current = true;
        clearCart();
        router.push(`/order/${data.orderId}?cash=1`);
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <h1 className="text-3xl font-bold text-stone-900 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6">
              <h2 className="font-semibold text-stone-900 mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="(555) 000-0000"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@email.com"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery details */}
            {orderType === "delivery" && (
              <div className="bg-white rounded-2xl border border-stone-200 p-6">
                <h2 className="font-semibold text-stone-900 mb-4">Delivery Address</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      required={orderType === "delivery"}
                      value={form.deliveryAddress}
                      onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
                      placeholder="123 Main St"
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        required={orderType === "delivery"}
                        value={form.deliveryCity}
                        onChange={(e) => setForm({ ...form, deliveryCity: e.target.value })}
                        placeholder="City"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="zip">ZIP *</Label>
                      <Input
                        id="zip"
                        required={orderType === "delivery"}
                        value={form.deliveryZip}
                        onChange={(e) => setForm({ ...form, deliveryZip: e.target.value })}
                        placeholder="00000"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment method */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6">
              <h2 className="font-semibold text-stone-900 mb-4">Payment Method</h2>
              <div className="flex gap-2 flex-wrap">
                {(
                  [
                    { key: "card", label: "Card" },
                    { key: "esewa", label: "eSewa" },
                    { key: "khalti", label: "Khalti" },
                    ...(orderType === "pickup"
                      ? [{ key: "cash" as const, label: "Cash at Pickup" }]
                      : []),
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setPaymentMethod(opt.key)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                      paymentMethod === opt.key
                        ? "bg-amber-700 text-white border-amber-700"
                        : "border-stone-200 text-stone-600 hover:border-stone-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {paymentMethod === "cash" && (
                <p className="text-sm text-stone-500 mt-2">
                  Have exact change ready — you&apos;ll pay when you pick up your order.
                </p>
              )}
              {paymentMethod === "esewa" && (
                <p className="text-sm text-stone-500 mt-2">
                  You&apos;ll be redirected to eSewa to complete payment.
                </p>
              )}
              {paymentMethod === "khalti" && (
                <p className="text-sm text-stone-500 mt-2">
                  You&apos;ll be redirected to Khalti to complete payment.
                </p>
              )}
            </div>

            {/* Tip */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6">
              <h2 className="font-semibold text-stone-900 mb-4">Add a Tip</h2>
              <div className="flex gap-2 flex-wrap">
                {TIP_OPTIONS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipPercent(t)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                      tipPercent === t
                        ? "bg-amber-700 text-white border-amber-700"
                        : "border-stone-200 text-stone-600 hover:border-stone-300"
                    }`}
                  >
                    {t === 0 ? "No tip" : `${t}%`}
                  </button>
                ))}
              </div>
              {tip > 0 && (
                <p className="text-sm text-stone-500 mt-2">
                  {formatPrice(tip)} tip — thank you! 🙏
                </p>
              )}
            </div>

            {/* Promo code */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6">
              <h2 className="font-semibold text-stone-900 mb-4">Promo Code</h2>
              {appliedPromo ? (
                <div className="flex items-center justify-between rounded-lg bg-green-50 border border-green-200 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      {appliedPromo.code} applied
                    </p>
                    <p className="text-xs text-green-700">
                      -{formatPrice(appliedPromo.discountAmount)} off your order
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={removePromo}
                    className="text-xs font-medium text-green-800 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex gap-2">
                    <Input
                      value={promoInput}
                      onChange={(e) => {
                        setPromoInput(e.target.value.toUpperCase());
                        setPromoError(null);
                      }}
                      placeholder="Enter promo code"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={applyPromo}
                      disabled={promoApplying || !promoInput.trim()}
                      variant="outline"
                    >
                      {promoApplying ? "Applying…" : "Apply"}
                    </Button>
                  </div>
                  {promoError && (
                    <p className="text-xs text-red-600 mt-2">{promoError}</p>
                  )}
                </div>
              )}
            </div>

            {/* Special instructions */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6">
              <h2 className="font-semibold text-stone-900 mb-4">Order Notes</h2>
              <textarea
                rows={3}
                value={form.specialInstructions}
                onChange={(e) => setForm({ ...form, specialInstructions: e.target.value })}
                placeholder="Any special instructions or allergy notes…"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </div>
          </div>

          {/* Order summary */}
          <div>
            <div className="bg-white rounded-2xl border border-stone-200 p-6 sticky top-24">
              <h2 className="font-semibold text-stone-900 mb-4">Order Summary</h2>

              <div className="space-y-2 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-stone-600">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="text-stone-800">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-stone-200 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Discount ({appliedPromo?.code})</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>Tax</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                {delivery > 0 && (
                  <div className="flex justify-between text-stone-600">
                    <span>Delivery</span>
                    <span>{formatPrice(delivery)}</span>
                  </div>
                )}
                {tip > 0 && (
                  <div className="flex justify-between text-stone-600">
                    <span>Tip ({tipPercent}%)</span>
                    <span>{formatPrice(tip)}</span>
                  </div>
                )}
                <div className="border-t border-stone-200 pt-2 flex justify-between font-bold text-stone-900">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full mt-5 bg-amber-700 hover:bg-amber-800 text-white rounded-full"
              >
                {loading
                  ? "Processing…"
                  : paymentMethod === "cash"
                  ? "Place Order"
                  : `Pay ${formatPrice(total)}`}
              </Button>

              <p className="text-xs text-stone-400 text-center mt-3">
                {paymentMethod === "cash"
                  ? "Pay with cash when you pick up your order"
                  : paymentMethod === "esewa"
                  ? "Secure payment via eSewa"
                  : paymentMethod === "khalti"
                  ? "Secure payment via Khalti"
                  : "Secure payment via Stripe"}
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
