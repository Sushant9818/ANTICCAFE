"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Phone, MapPin, Clock } from "lucide-react";
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
  orderType: string;
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

export function KitchenBoard({ initialOrders }: Props) {
  const [orders, setOrders] = useState(initialOrders);

  const handleDecision = async (orderId: string, status: "confirmed" | "cancelled") => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update");
      const order = orders.find((o) => o.id === orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      toast.success(
        status === "confirmed"
          ? `Order #${order?.orderNumber} approved`
          : `Order #${order?.orderNumber} rejected`
      );
    } catch {
      toast.error("Failed to update order");
    }
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 text-stone-400">
        <p>No orders waiting for approval.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="font-bold text-stone-900">#{order.orderNumber}</p>
              <p className="text-sm text-stone-600">{order.customerName}</p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium capitalize bg-yellow-100 text-yellow-800">
              Pending
            </span>
          </div>

          {order.customerPhone && (
            <a
              href={`tel:${order.customerPhone}`}
              className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-amber-700 transition-colors"
            >
              <Phone className="h-3 w-3" />
              {order.customerPhone}
            </a>
          )}

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

          {order.orderType === "delivery" && order.deliveryAddress && (
            <p className="flex items-start gap-1.5 text-xs text-stone-500">
              <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
              {order.deliveryAddress}, {order.deliveryCity}
            </p>
          )}

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

          <div className="border-t border-stone-100 pt-2 flex justify-between font-semibold text-stone-900 text-sm">
            <span>Total</span>
            <span>{formatPrice(Number(order.total))}</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleDecision(order.id, "confirmed")}
              className="flex-1 py-2 rounded-xl bg-amber-700 text-white text-sm font-medium hover:bg-amber-800 transition-colors"
            >
              Approve
            </button>
            <button
              onClick={() => handleDecision(order.id, "cancelled")}
              className="flex-1 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
