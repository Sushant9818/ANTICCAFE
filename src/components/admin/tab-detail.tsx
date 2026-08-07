"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Plus, Minus, Leaf } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS_COLORS } from "@/lib/constants";

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

type Round = {
  id: string;
  status: string;
  total: string;
  createdAt: Date;
  items: { id: string; itemName: string; itemPrice: string; quantity: number }[];
};

type Tab = {
  id: string;
  status: string;
  tableNumber: number;
  serverName: string | null;
  rounds: Round[];
};

type Props = {
  tab: Tab;
  menuItems: MenuItem[];
  categories: Category[];
  basePath?: string;
  billLabel?: string;
};

type CartLine = { id: string; name: string; price: number; quantity: number };

function RoundCard({
  round,
  index,
  onCancel,
  cancelling,
}: {
  round: Round;
  index: number;
  onCancel?: (round: Round) => void;
  cancelling?: boolean;
}) {
  const editable = onCancel && ["pending", "confirmed"].includes(round.status);
  return (
    <div className="bg-stone-900 rounded-xl border border-stone-800 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="font-medium text-white font-[family-name:var(--font-fraunces)]">
          Round {index + 1}
        </p>
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
              ORDER_STATUS_COLORS[round.status] ?? "bg-admin-cream text-admin-taupe"
            }`}
          >
            {round.status.replace(/_/g, " ")}
          </span>
          {editable && (
            <button
              onClick={() => onCancel!(round)}
              disabled={cancelling}
              className="text-xs text-red-400 hover:text-red-300 font-medium disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
      <div className="space-y-1">
        {round.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm text-stone-300">
            <span>
              {item.itemName} × {item.quantity}
            </span>
            <span className="font-[family-name:var(--font-plex-mono)]">
              {formatPrice(Number(item.itemPrice) * item.quantity)}
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-sm font-semibold text-white border-t border-dashed border-stone-700 mt-2 pt-2">
        <span className="font-sans font-medium">Round Total</span>
        <span className="font-[family-name:var(--font-plex-mono)]">{formatPrice(Number(round.total))}</span>
      </div>
    </div>
  );
}

export function TabDetail({
  tab,
  menuItems,
  categories,
  basePath = "/admin/tables",
  billLabel = "Close & Pay",
}: Props) {
  const router = useRouter();
  const [rounds, setRounds] = useState(tab.rounds);
  const [status, setStatus] = useState(tab.status);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);
  const [cancellingTab, setCancellingTab] = useState(false);
  const [cancellingRoundId, setCancellingRoundId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "esewa" | "khalti">("cash");

  const activeRounds = rounds.filter((r) => r.status !== "cancelled");
  const tabTotal = activeRounds.reduce((sum, r) => sum + Number(r.total), 0);
  const cartTotal = cart.reduce((sum, l) => sum + l.price * l.quantity, 0);

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

  const sendToKitchen = async () => {
    if (cart.length === 0) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/tabs/${tab.id}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((l) => ({ id: l.id, name: l.name, price: l.price, quantity: l.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const subtotal = cartTotal;
      const tax = subtotal * 0.0875;
      setRounds((prev) => [
        ...prev,
        {
          id: data.orderId,
          status: "pending",
          total: (subtotal + tax).toFixed(2),
          createdAt: new Date(),
          items: cart.map((l) => ({
            id: l.id,
            itemName: l.name,
            itemPrice: l.price.toFixed(2),
            quantity: l.quantity,
          })),
        },
      ]);
      setCart([]);
      toast.success("Sent to kitchen");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send round");
    } finally {
      setSending(false);
    }
  };

  const closeTab = async () => {
    if (!confirm(`Close Table ${tab.tableNumber}'s tab for ${formatPrice(tabTotal)} via ${paymentMethod}?`)) {
      return;
    }
    setClosing(true);
    try {
      const res = await fetch(`/api/admin/tabs/${tab.id}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus("closed");
      toast.success("Tab closed");
      router.push(basePath);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to close tab");
    } finally {
      setClosing(false);
    }
  };

  const cancelTab = async () => {
    if (!confirm(`Cancel Table ${tab.tableNumber}'s tab and empty it? This can't be undone.`)) return;
    setCancellingTab(true);
    try {
      const res = await fetch(`/api/admin/tabs/${tab.id}/cancel`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus("cancelled");
      toast.success("Table cancelled and emptied");
      router.push(basePath);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel table");
    } finally {
      setCancellingTab(false);
    }
  };

  const cancelRound = async (round: Round) => {
    if (!confirm(`Cancel Round ${rounds.indexOf(round) + 1}? This can't be undone.`)) return;
    setCancellingRoundId(round.id);
    try {
      const res = await fetch(`/api/admin/tabs/${tab.id}/orders/${round.id}/cancel`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRounds((prev) => prev.map((r) => (r.id === round.id ? { ...r, status: "cancelled" } : r)));
      toast.success("Round cancelled");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel round");
    } finally {
      setCancellingRoundId(null);
    }
  };

  return (
    <div>
      <button
        onClick={() => router.push(basePath)}
        className="flex items-center gap-1.5 text-sm text-admin-taupe hover:text-white mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Tables
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-admin-taupe font-[family-name:var(--font-plex-mono)] mb-1">
            {status}
          </p>
          <h1 className="text-3xl font-semibold text-white font-[family-name:var(--font-fraunces)]">
            Table {tab.tableNumber}
            {tab.serverName && (
              <span className="text-admin-taupe font-normal text-2xl"> — {tab.serverName}</span>
            )}
          </h1>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-admin-taupe">Tab Total</p>
          <p className="text-2xl font-semibold text-white font-[family-name:var(--font-plex-mono)]">
            {formatPrice(tabTotal)}
          </p>
        </div>
      </div>

      {status !== "open" ? (
        <div className="space-y-4">
          <h2 className="font-[family-name:var(--font-fraunces)] font-semibold text-white">Rounds</h2>
          {rounds.map((round, idx) => (
            <RoundCard key={round.id} round={round} index={idx} />
          ))}
        </div>
      ) : (
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

          {/* Right column: current round, close tab, rounds history */}
          <div className="space-y-4 xl:sticky xl:top-24">
            <div className="bg-stone-900 rounded-xl border border-stone-800 p-5">
              <h2 className="font-[family-name:var(--font-fraunces)] font-semibold text-white mb-3">
                Current Round
              </h2>

              {cart.length === 0 ? (
                <p className="text-sm text-admin-taupe text-center py-6">
                  Tap items to add them to this round.
                </p>
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
                  <div className="flex justify-between text-sm font-semibold pt-2 border-t border-dashed border-stone-700">
                    <span className="font-sans">Round Total</span>
                    <span className="font-[family-name:var(--font-plex-mono)]">{formatPrice(cartTotal)}</span>
                  </div>
                </div>
              )}

              <button
                onClick={sendToKitchen}
                disabled={cart.length === 0 || sending}
                className="w-full py-2.5 rounded-full bg-admin-amber text-white text-sm font-semibold hover:bg-admin-amber/90 disabled:opacity-50"
              >
                {sending ? "Sending…" : "Send to Kitchen"}
              </button>
            </div>

            <div className="bg-stone-900 rounded-xl border border-stone-800 p-6">
              <h2 className="font-[family-name:var(--font-fraunces)] font-semibold text-white mb-4">
                {billLabel}
              </h2>
              <div className="flex gap-2 flex-wrap mb-4">
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
              <button
                onClick={closeTab}
                disabled={closing || activeRounds.length === 0}
                className="w-full py-3 rounded-full bg-admin-amber text-white text-sm font-semibold hover:bg-admin-amber/90 disabled:opacity-50"
              >
                {closing ? "Closing…" : `${billLabel} ${formatPrice(tabTotal)}`}
              </button>
              <button
                onClick={cancelTab}
                disabled={cancellingTab}
                className="w-full mt-2 py-2.5 rounded-full border border-red-900/50 text-red-400 text-sm font-medium hover:bg-red-950/50 transition-colors disabled:opacity-50"
              >
                {cancellingTab ? "Cancelling…" : "Cancel Table & Empty"}
              </button>
            </div>

            {rounds.length > 0 && (
              <div className="space-y-3">
                <h2 className="font-[family-name:var(--font-fraunces)] font-semibold text-white">
                  Rounds Sent
                </h2>
                {rounds.map((round, idx) => (
                  <RoundCard
                    key={round.id}
                    round={round}
                    index={idx}
                    onCancel={cancelRound}
                    cancelling={cancellingRoundId === round.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
