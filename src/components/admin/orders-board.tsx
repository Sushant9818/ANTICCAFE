"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Phone, MapPin, Clock } from "lucide-react";
import { ORDER_STATUS_COLORS, ORDER_STATUSES } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

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
  customerEmail: string | null;
  orderType: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  subtotal: string;
  tax: string;
  tip: string | null;
  deliveryFee: string | null;
  total: string;
  specialInstructions: string | null;
  deliveryAddress: string | null;
  deliveryCity: string | null;
  createdAt: Date | null;
  refundRequested: boolean;
  refundReason: string | null;
  items: OrderItem[];
};

type Props = {
  initialOrders: Order[];
};

const STATUS_FLOW: Record<string, string> = {
  confirmed: "preparing",
  preparing: "ready",
  ready: "out_for_delivery",
  out_for_delivery: "delivered",
};

function getNextStatus(order: Order): string | null {
  if (order.status === "ready") {
    return order.orderType === "delivery" ? "out_for_delivery" : "delivered";
  }
  return STATUS_FLOW[order.status] ?? null;
}

function getNextStatusLabel(order: Order, nextStatus: string): string {
  if (order.status === "ready" && order.orderType !== "delivery") {
    return "picked up";
  }
  return nextStatus.replace(/_/g, " ");
}

export function AdminOrdersBoard({ initialOrders }: Props) {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState<string>("active");
  const [decidingId, setDecidingId] = useState<string | null>(null);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      toast.success(`Order #${orders.find((o) => o.id === orderId)?.orderNumber} → ${newStatus}`);
    } catch {
      toast.error("Failed to update order status");
    }
  };

  const decideRefund = async (orderId: string, approve: boolean) => {
    setDecidingId(orderId);
    try {
      const res = await fetch(`/api/admin/refunds/${orderId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approve }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, refundRequested: false, paymentStatus: approve ? "refunded" : o.paymentStatus }
            : o
        )
      );
      toast.success(approve ? "Refund approved" : "Refund denied");
    } catch {
      toast.error("Failed to process refund decision");
    } finally {
      setDecidingId(null);
    }
  };

  const refundCount = orders.filter((o) => o.refundRequested).length;

  const filtered = orders.filter((o) => {
    if (filter === "active") return !["delivered", "cancelled"].includes(o.status);
    if (filter === "delivered") return o.status === "delivered";
    if (filter === "cancelled") return o.status === "cancelled";
    if (filter === "refunds") return o.refundRequested;
    return true;
  });

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "active", label: "Active" },
          { key: "delivered", label: "Delivered" },
          { key: "refunds", label: `Refunds${refundCount > 0 ? ` (${refundCount})` : ""}` },
          { key: "all", label: "All Orders" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === key
                ? "bg-admin-amber text-white"
                : "bg-stone-900 border border-stone-800 text-stone-300 hover:bg-stone-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-stone-500">
          <p>No orders found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((order) => (
            <div
              key={order.id}
              className="bg-stone-900 rounded-2xl border border-stone-800 p-5 space-y-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-white">#{order.orderNumber}</p>
                  <p className="text-sm text-stone-300">{order.customerName}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {order.refundRequested && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-900/40 text-amber-400">
                      Refund requested
                    </span>
                  )}
                  {order.paymentMethod && order.paymentMethod !== "card" && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-admin-cream text-admin-amber capitalize">
                      {order.paymentMethod}
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                      ORDER_STATUS_COLORS[order.status] ?? "bg-stone-800 text-stone-300"
                    }`}
                  >
                    {order.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>

              {/* Contact */}
              {order.customerPhone && (
                <a
                  href={`tel:${order.customerPhone}`}
                  className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-admin-amber transition-colors"
                >
                  <Phone className="h-3 w-3" />
                  {order.customerPhone}
                </a>
              )}

              {/* Type & time */}
              <div className="flex items-center gap-3 text-xs text-stone-500">
                <span className="capitalize font-medium text-stone-300">
                  {order.orderType.replace(/_/g, " ")}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </span>
              </div>

              {/* Delivery address */}
              {order.orderType === "delivery" && order.deliveryAddress && (
                <p className="flex items-start gap-1.5 text-xs text-stone-400">
                  <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                  {order.deliveryAddress}, {order.deliveryCity}
                </p>
              )}

              {/* Items */}
              <div className="border-t border-dashed border-stone-800 pt-3 space-y-1">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-stone-300">
                      {item.itemName} × {item.quantity}
                    </span>
                    <span className="text-stone-400">
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

              {/* Total */}
              <div className="border-t border-dashed border-stone-800 pt-2 flex justify-between font-semibold text-white text-sm">
                <span>Total</span>
                <span>{formatPrice(Number(order.total))}</span>
              </div>

              {/* Refund request */}
              {order.refundRequested && (
                <div className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-3 space-y-2">
                  {order.refundReason && (
                    <p className="text-xs text-amber-300/80 italic">"{order.refundReason}"</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => decideRefund(order.id, true)}
                      disabled={decidingId === order.id}
                      className="flex-1 py-1.5 rounded-lg bg-admin-amber text-white text-xs font-semibold hover:bg-admin-amber/90 disabled:opacity-50"
                    >
                      Approve Refund
                    </button>
                    <button
                      onClick={() => decideRefund(order.id, false)}
                      disabled={decidingId === order.id}
                      className="flex-1 py-1.5 rounded-lg border border-stone-700 text-stone-300 text-xs font-medium hover:border-stone-600 disabled:opacity-50"
                    >
                      Deny
                    </button>
                  </div>
                </div>
              )}

              {/* Action */}
              {getNextStatus(order) && (
                <button
                  onClick={() => handleStatusUpdate(order.id, getNextStatus(order)!)}
                  className="w-full py-2 rounded-xl bg-admin-amber text-white text-sm font-medium hover:bg-admin-amber/90 transition-colors capitalize"
                >
                  Mark as {getNextStatusLabel(order, getNextStatus(order)!)}
                </button>
              )}

              {order.status === "pending" && (
                <button
                  onClick={() => handleStatusUpdate(order.id, "cancelled")}
                  className="w-full py-2 rounded-xl border border-red-900/50 text-red-400 text-sm font-medium hover:bg-red-950/50 transition-colors"
                >
                  Cancel Order
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
