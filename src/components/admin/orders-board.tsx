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

export function AdminOrdersBoard({ initialOrders }: Props) {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState<string>("active");

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

  const filtered = orders.filter((o) => {
    if (filter === "active") return !["delivered", "cancelled"].includes(o.status);
    if (filter === "delivered") return o.status === "delivered";
    if (filter === "cancelled") return o.status === "cancelled";
    return true;
  });

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "active", label: "Active" },
          { key: "delivered", label: "Delivered" },
          { key: "all", label: "All Orders" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === key
                ? "bg-stone-900 text-white"
                : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <p>No orders found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-stone-900">#{order.orderNumber}</p>
                  <p className="text-sm text-stone-600">{order.customerName}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {order.paymentMethod && order.paymentMethod !== "card" && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 capitalize">
                      {order.paymentMethod}
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                      ORDER_STATUS_COLORS[order.status] ?? "bg-stone-100 text-stone-700"
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
                  className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-amber-700 transition-colors"
                >
                  <Phone className="h-3 w-3" />
                  {order.customerPhone}
                </a>
              )}

              {/* Type & time */}
              <div className="flex items-center gap-3 text-xs text-stone-400">
                <span className="capitalize font-medium text-stone-600">{order.orderType}</span>
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
                <p className="flex items-start gap-1.5 text-xs text-stone-500">
                  <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                  {order.deliveryAddress}, {order.deliveryCity}
                </p>
              )}

              {/* Items */}
              <div className="border-t border-stone-100 pt-3 space-y-1">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-stone-700">
                      {item.itemName} × {item.quantity}
                    </span>
                    <span className="text-stone-500">
                      {formatPrice(Number(item.itemPrice) * item.quantity)}
                    </span>
                  </div>
                ))}
                {order.specialInstructions && (
                  <p className="text-xs text-stone-400 italic mt-1">
                    Note: {order.specialInstructions}
                  </p>
                )}
              </div>

              {/* Total */}
              <div className="border-t border-stone-100 pt-2 flex justify-between font-semibold text-stone-900 text-sm">
                <span>Total</span>
                <span>{formatPrice(Number(order.total))}</span>
              </div>

              {/* Action */}
              {STATUS_FLOW[order.status] && (
                <button
                  onClick={() =>
                    handleStatusUpdate(order.id, STATUS_FLOW[order.status])
                  }
                  className="w-full py-2 rounded-xl bg-amber-700 text-white text-sm font-medium hover:bg-amber-800 transition-colors capitalize"
                >
                  Mark as {STATUS_FLOW[order.status].replace(/_/g, " ")}
                </button>
              )}

              {order.status === "pending" && (
                <button
                  onClick={() => handleStatusUpdate(order.id, "cancelled")}
                  className="w-full py-2 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
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
