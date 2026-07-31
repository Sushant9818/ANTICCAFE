"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Phone, MapPin, Clock } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUSES } from "@/lib/constants";

type OrderItem = {
  id: string;
  itemName: string;
  itemPrice: string;
  quantity: number;
  specialInstructions: string | null;
};

type Order = {
  id: string;
  orderNumber: number;
  customerName: string;
  customerPhone: string | null;
  orderType: string;
  status: string;
  total: string;
  specialInstructions: string | null;
  deliveryAddress: string | null;
  deliveryCity: string | null;
  createdAt: Date | null;
  estimatedReadyAt: Date | null;
  items: OrderItem[];
};

type Props = {
  initialOrders: Order[];
};

type UpdateBody =
  | { status: "confirmed"; estimatedMinutes: number }
  | { status: "preparing" }
  | { status: "ready" }
  | { status: "cancelled" };

const PREP_MINUTES = [10, 15, 20, 30];
const POLL_INTERVAL_MS = 15_000;

const SECTIONS: { key: "pending" | "confirmed" | "preparing"; title: string }[] = [
  { key: "pending", title: "Pending" },
  { key: "confirmed", title: "Confirmed" },
  { key: "preparing", title: "Preparing" },
];

const UPDATE_TOAST_LABEL: Record<UpdateBody["status"], string> = {
  confirmed: "approved",
  preparing: "moved to preparing",
  ready: "marked ready",
  cancelled: "rejected",
};

const STATUS_BADGE_COLORS: Record<string, string> = {
  pending: "bg-amber-900 text-amber-200",
  confirmed: "bg-blue-900 text-blue-300",
  preparing: "bg-orange-900 text-orange-300",
};

function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function KitchenBoard({ initialOrders }: Props) {
  const [orders, setOrders] = useState(initialOrders);
  const [pickingId, setPickingId] = useState<string | null>(null);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch("/api/admin/orders/kitchen");
        if (!res.ok) return;
        const data: Order[] = await res.json();
        setOrders(data);
      } catch {
        // transient network/poll failure — try again next interval
      }
    };

    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const updateOrder = async (orderId: string, body: UpdateBody) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update");
      const updated = await res.json();
      const order = orders.find((o) => o.id === orderId);

      if (body.status === "ready" || body.status === "cancelled") {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
      } else {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: body.status,
                  estimatedReadyAt: updated.estimated_ready_at ?? o.estimatedReadyAt,
                }
              : o
          )
        );
      }

      toast.success(`Order #${order?.orderNumber} ${UPDATE_TOAST_LABEL[body.status]}`);
    } catch {
      toast.error("Failed to update order");
    }
    setPickingId(null);
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 text-stone-400">
        <p>No orders in the kitchen right now.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {SECTIONS.map((section) => {
        const sectionOrders = orders.filter((o) => o.status === section.key);
        if (sectionOrders.length === 0) return null;

        return (
          <div key={section.key}>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400 mb-4">
              {section.title} ({sectionOrders.length})
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
              {sectionOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-stone-900 rounded-2xl border border-stone-800 p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-white">#{order.orderNumber}</p>
                      <p className="text-sm text-stone-300">{order.customerName}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize whitespace-nowrap ${
                        STATUS_BADGE_COLORS[order.status] ?? "bg-stone-800 text-stone-300"
                      }`}
                    >
                      {ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES] ?? order.status}
                    </span>
                  </div>

                  {order.estimatedReadyAt && (
                    <p className="text-xs font-medium text-amber-400">
                      Ready by {formatTime(order.estimatedReadyAt)}
                    </p>
                  )}

                  {order.customerPhone && (
                    <a
                      href={`tel:${order.customerPhone}`}
                      className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-amber-400 transition-colors"
                    >
                      <Phone className="h-3 w-3" />
                      {order.customerPhone}
                    </a>
                  )}

                  <div className="flex items-center gap-3 text-xs text-stone-500">
                    <span className="capitalize font-medium text-stone-300">{order.orderType}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {order.createdAt ? formatTime(order.createdAt) : "—"}
                    </span>
                  </div>

                  {order.orderType === "delivery" && order.deliveryAddress && (
                    <p className="flex items-start gap-1.5 text-xs text-stone-400">
                      <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                      {order.deliveryAddress}, {order.deliveryCity}
                    </p>
                  )}

                  <div className="border-t border-stone-800 pt-3 space-y-1">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-stone-300">
                          {item.itemName} × {item.quantity}
                        </span>
                        <span className="text-stone-500">
                          {formatPrice(Number(item.itemPrice) * item.quantity)}
                        </span>
                      </div>
                    ))}
                    {order.specialInstructions && (
                      <p className="text-xs text-stone-500 italic mt-1">
                        Note: {order.specialInstructions}
                      </p>
                    )}
                  </div>

                  <div className="border-t border-stone-800 pt-2 flex justify-between font-semibold text-white text-sm">
                    <span>Total</span>
                    <span>{formatPrice(Number(order.total))}</span>
                  </div>

                  {section.key === "pending" &&
                    (pickingId === order.id ? (
                      <div className="flex gap-2 flex-wrap">
                        {PREP_MINUTES.map((min) => (
                          <button
                            key={min}
                            onClick={() => updateOrder(order.id, { status: "confirmed", estimatedMinutes: min })}
                            className="px-3 py-1.5 rounded-xl bg-amber-700 text-white text-xs font-medium hover:bg-amber-800 transition-colors"
                          >
                            {min} min
                          </button>
                        ))}
                        <button
                          onClick={() => setPickingId(null)}
                          className="px-3 py-1.5 rounded-xl border border-stone-700 text-stone-300 text-xs font-medium hover:bg-stone-800 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPickingId(order.id)}
                          className="flex-1 py-2 rounded-xl bg-amber-700 text-white text-sm font-medium hover:bg-amber-800 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateOrder(order.id, { status: "cancelled" })}
                          className="flex-1 py-2 rounded-xl border border-red-900 text-red-400 text-sm font-medium hover:bg-red-950 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    ))}

                  {section.key === "confirmed" && (
                    <button
                      onClick={() => updateOrder(order.id, { status: "preparing" })}
                      className="w-full py-2 rounded-xl bg-amber-700 text-white text-sm font-medium hover:bg-amber-800 transition-colors"
                    >
                      Start Preparing
                    </button>
                  )}

                  {section.key === "preparing" && (
                    <button
                      onClick={() => updateOrder(order.id, { status: "ready" })}
                      className="w-full py-2 rounded-xl bg-amber-700 text-white text-sm font-medium hover:bg-amber-800 transition-colors"
                    >
                      Mark Ready
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
