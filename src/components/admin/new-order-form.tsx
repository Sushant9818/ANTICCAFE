"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Plus, Minus, Leaf } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { TAX_RATE, DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from "@/lib/constants";

type MenuItem = {
  id: string;
  name: string;
  price: string;
  categoryId: string;
  categoryName: string;
  description: string | null;
  imageUrl: string | null;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
};

type Category = {
  id: string;
  name: string;
};

type CartLine = { id: string; name: string; price: number; quantity: number };

type Props = {
  menuItems: MenuItem[];
  categories: Category[];
};

export function NewOrderForm({ menuItems, categories }: Props) {
  const router = useRouter();
  const [orderType, setOrderType] = useState<"pickup" | "delivery">("pickup");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "esewa" | "khalti">("cash");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    deliveryAddress: "",
    deliveryCity: "",
    deliveryState: "",
    deliveryZip: "",
    specialInstructions: "",
  });

  const subtotal = cart.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const delivery = orderType === "delivery" && subtotal < FREE_DELIVERY_THRESHOLD ? DELIVERY_FEE : 0;
  const total = subtotal + tax + delivery;

  const filteredItems =
    activeCategory === "all" ? menuItems : menuItems.filter((i) => i.categoryId === activeCategory);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.id === item.id);
      if (existing) {
        return prev.map((l) => (l.id === item.id ? { ...l, quantity: l.quantity + 1 } : l));
      }
      return [...prev, { id: item.id, name: item.name, price: Number(item.price), quantity: 1 }];
    });
    toast.success(`${item.name} added`);
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCart((prev) =>
      quantity <= 0 ? prev.filter((l) => l.id !== id) : prev.map((l) => (l.id === id ? { ...l, quantity } : l))
    );
  };

  const submit = async () => {
    if (cart.length === 0) {
      toast.error("Add at least one item");
      return;
    }
    if (!form.name.trim()) {
      toast.error("Enter a customer name");
      return;
    }
    if (orderType === "delivery" && (!form.deliveryAddress.trim() || !form.deliveryCity.trim())) {
      toast.error("Enter a delivery address and city");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((l) => ({ id: l.id, name: l.name, price: l.price, quantity: l.quantity })),
          orderType,
          paymentMethod,
          customerName: form.name,
          customerPhone: form.phone,
          customerEmail: form.email,
          deliveryAddress: form.deliveryAddress,
          deliveryCity: form.deliveryCity,
          deliveryState: form.deliveryState,
          deliveryZip: form.deliveryZip,
          specialInstructions: form.specialInstructions,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Order created");
      router.push("/admin/orders");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => router.push("/admin/orders")}
        className="flex items-center gap-1.5 text-sm text-admin-taupe hover:text-white mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Orders
      </button>

      <h1 className="text-3xl font-semibold text-white font-[family-name:var(--font-fraunces)] mb-6">
        New Order
      </h1>

      <div className="max-w-3xl space-y-6 mb-8">
        <div className="bg-stone-900 rounded-xl border border-stone-800 p-6">
          <h2 className="font-[family-name:var(--font-fraunces)] font-semibold text-white mb-4">
            Order Type
          </h2>
          <div className="flex gap-2">
            {(["pickup", "delivery"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setOrderType(t)}
                className={`px-4 py-2 rounded-full text-sm font-medium border capitalize transition-colors ${
                  orderType === t
                    ? "bg-admin-amber text-white border-admin-amber"
                    : "border-stone-700 text-stone-300 hover:border-stone-600"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-stone-900 rounded-xl border border-stone-800 p-6">
          <h2 className="font-[family-name:var(--font-fraunces)] font-semibold text-white mb-4">
            Customer
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Name *"
              className="rounded-lg border border-stone-700 px-3 py-2 text-sm col-span-2 focus:outline-none focus:border-admin-amber"
            />
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Phone"
              className="rounded-lg border border-stone-700 px-3 py-2 text-sm focus:outline-none focus:border-admin-amber"
            />
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email"
              className="rounded-lg border border-stone-700 px-3 py-2 text-sm focus:outline-none focus:border-admin-amber"
            />
          </div>

          {orderType === "delivery" && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <input
                value={form.deliveryAddress}
                onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
                placeholder="Street Address *"
                className="rounded-lg border border-stone-700 px-3 py-2 text-sm col-span-2 focus:outline-none focus:border-admin-amber"
              />
              <input
                value={form.deliveryCity}
                onChange={(e) => setForm({ ...form, deliveryCity: e.target.value })}
                placeholder="City *"
                className="rounded-lg border border-stone-700 px-3 py-2 text-sm focus:outline-none focus:border-admin-amber"
              />
              <input
                value={form.deliveryZip}
                onChange={(e) => setForm({ ...form, deliveryZip: e.target.value })}
                placeholder="ZIP"
                className="rounded-lg border border-stone-700 px-3 py-2 text-sm focus:outline-none focus:border-admin-amber"
              />
            </div>
          )}

          <textarea
            value={form.specialInstructions}
            onChange={(e) => setForm({ ...form, specialInstructions: e.target.value })}
            placeholder="Order notes…"
            rows={2}
            className="w-full rounded-lg border border-stone-700 px-3 py-2 text-sm mt-4 resize-none focus:outline-none focus:border-admin-amber"
          />
        </div>

        <div className="bg-stone-900 rounded-xl border border-stone-800 p-6">
          <h2 className="font-[family-name:var(--font-fraunces)] font-semibold text-white mb-4">
            Payment Method
          </h2>
          <div className="flex gap-2 flex-wrap">
            {(["cash", "card", "esewa", "khalti"] as const).map((method) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`px-4 py-2 rounded-full text-sm font-medium border capitalize transition-colors ${
                  paymentMethod === method
                    ? "bg-admin-amber text-white border-admin-amber"
                    : "border-stone-700 text-stone-300 hover:border-stone-600"
                }`}
              >
                {method}
              </button>
            ))}
          </div>
          <p className="text-xs text-admin-taupe mt-2">
            Payment is recorded as collected immediately — use this for in-person orders only.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
        {/* Menu — full menu-page style */}
        <div>
          <h2 className="font-[family-name:var(--font-fraunces)] text-xl font-semibold text-white mb-4">
            Menu
          </h2>
          <div className="flex gap-2 flex-wrap mb-6">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === "all"
                  ? "bg-admin-amber text-white"
                  : "bg-admin-cream text-admin-taupe hover:text-white"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat.id
                    ? "bg-admin-amber text-white"
                    : "bg-admin-cream text-admin-taupe hover:text-white"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {filteredItems.length === 0 ? (
            <p className="text-center py-16 text-admin-taupe">No items in this category.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="group text-left bg-stone-900 rounded-xl border border-stone-800 overflow-hidden hover:border-admin-amber hover:shadow-sm transition-all"
                >
                  <div className="h-32 bg-admin-cream flex items-center justify-center overflow-hidden">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <span className="text-4xl select-none">☕</span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-medium text-white text-sm">{item.name}</h3>
                      <span className="text-xs font-semibold text-admin-amber font-[family-name:var(--font-plex-mono)] whitespace-nowrap">
                        {formatPrice(Number(item.price))}
                      </span>
                    </div>
                    {activeCategory === "all" && (
                      <p className="text-[11px] text-admin-taupe mb-1">{item.categoryName}</p>
                    )}
                    {item.description && (
                      <p className="text-xs text-stone-400 line-clamp-2 mb-2">{item.description}</p>
                    )}
                    {(item.isVegetarian || item.isVegan || item.isGlutenFree) && (
                      <div className="flex gap-1">
                        {item.isVegetarian && (
                          <span className="flex items-center gap-0.5 text-[10px] font-medium text-admin-sage bg-admin-sage/10 px-1.5 py-0.5 rounded-full">
                            <Leaf className="h-2.5 w-2.5" /> V
                          </span>
                        )}
                        {item.isVegan && (
                          <span className="text-[10px] font-medium text-admin-sage bg-admin-sage/10 px-1.5 py-0.5 rounded-full">
                            VE
                          </span>
                        )}
                        {item.isGlutenFree && (
                          <span className="text-[10px] font-medium text-admin-amber bg-admin-cream px-1.5 py-0.5 rounded-full">
                            GF
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Order summary */}
        <div className="bg-stone-900 rounded-xl border border-stone-800 p-5 xl:sticky xl:top-24">
          <h2 className="font-[family-name:var(--font-fraunces)] font-semibold text-white mb-3">
            Current Order
          </h2>

          {cart.length === 0 ? (
            <p className="text-sm text-admin-taupe text-center py-6">Tap items to add them to the order.</p>
          ) : (
            <div className="space-y-2 mb-4">
              {cart.map((line) => (
                <div key={line.id} className="flex items-center justify-between text-sm">
                  <span className="text-stone-300 truncate">{line.name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => updateQuantity(line.id, line.quantity - 1)}
                      className="p-1 rounded-full hover:bg-admin-cream"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-4 text-center font-[family-name:var(--font-plex-mono)]">
                      {line.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(line.id, line.quantity + 1)}
                      className="p-1 rounded-full hover:bg-admin-cream"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="border-t border-dashed border-stone-700 pt-2 space-y-1 text-sm font-[family-name:var(--font-plex-mono)]">
                <div className="flex justify-between text-admin-taupe">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-admin-taupe">
                  <span>Tax</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                {delivery > 0 && (
                  <div className="flex justify-between text-admin-taupe">
                    <span>Delivery</span>
                    <span>{formatPrice(delivery)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-white text-base">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={submit}
            disabled={cart.length === 0 || submitting}
            className="w-full py-2.5 rounded-full bg-admin-amber text-white text-sm font-semibold hover:bg-admin-amber/90 disabled:opacity-50"
          >
            {submitting ? "Creating…" : `Create Order ${cart.length > 0 ? formatPrice(total) : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}
