"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Phone, MapPin, Package, Bike } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type DeliveryItem = { id: string; itemName: string; itemPrice: string; quantity: number };

type Delivery = {
  id: string;
  orderNumber: number;
  customerName: string;
  customerPhone: string | null;
  status: string;
  total: string;
  deliveryAddress: string | null;
  deliveryCity: string | null;
  deliveryState: string | null;
  deliveryZip: string | null;
  specialInstructions: string | null;
  createdAt: Date;
  items: DeliveryItem[];
};

type Props = {
  initialDeliveries: Delivery[];
};

const SECTIONS: { key: string; title: string; icon: typeof Package; nextStatus: string; actionLabel: string }[] = [
  { key: "ready", title: "Ready for Pickup", icon: Package, nextStatus: "out_for_delivery", actionLabel: "Mark Picked Up" },
  { key: "out_for_delivery", title: "Out for Delivery", icon: Bike, nextStatus: "delivered", actionLabel: "Mark Delivered" },
];

export function DeliveriesBoard({ initialDeliveries }: Props) {
  const [deliveries, setDeliveries] = useState(initialDeliveries);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update");
      if (status === "delivered") {
        setDeliveries((prev) => prev.filter((d) => d.id !== id));
      } else {
        setDeliveries((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
      }
      toast.success(status === "delivered" ? "Marked delivered" : "Marked picked up");
    } catch {
      toast.error("Failed to update delivery");
    } finally {
      setUpdatingId(null);
    }
  };

  if (deliveries.length === 0) {
    return (
      <div className="text-center py-16 text-stone-500">
        <p>No deliveries right now.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {SECTIONS.map((section) => {
        const sectionDeliveries = deliveries.filter((d) => d.status === section.key);
        if (sectionDeliveries.length === 0) return null;
        const Icon = section.icon;

        return (
          <div key={section.key}>
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-stone-400 mb-4">
              <Icon className="h-4 w-4" />
              {section.title} ({sectionDeliveries.length})
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
              {sectionDeliveries.map((order) => (
                <div key={order.id} className="bg-stone-900 rounded-2xl border border-stone-800 p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-white">#{order.orderNumber}</p>
                      <p className="text-sm text-stone-300">{order.customerName}</p>
                    </div>
                    <span className="font-semibold text-white text-sm font-[family-name:var(--font-plex-mono)]">
                      {formatPrice(Number(order.total))}
                    </span>
                  </div>

                  {order.customerPhone && (
                    <a
                      href={`tel:${order.customerPhone}`}
                      className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-admin-amber transition-colors"
                    >
                      <Phone className="h-3 w-3" />
                      {order.customerPhone}
                    </a>
                  )}

                  {order.deliveryAddress && (
                    <p className="flex items-start gap-1.5 text-xs text-stone-400">
                      <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                      {order.deliveryAddress}, {order.deliveryCity} {order.deliveryState} {order.deliveryZip}
                    </p>
                  )}

                  <div className="border-t border-dashed border-stone-800 pt-3 space-y-1">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-stone-300">
                          {item.itemName} × {item.quantity}
                        </span>
                      </div>
                    ))}
                    {order.specialInstructions && (
                      <p className="text-xs text-stone-500 italic mt-1">Note: {order.specialInstructions}</p>
                    )}
                  </div>

                  <button
                    onClick={() => updateStatus(order.id, section.nextStatus)}
                    disabled={updatingId === order.id}
                    className="w-full py-2 rounded-xl bg-admin-amber text-white text-sm font-medium hover:bg-admin-amber/90 transition-colors disabled:opacity-50"
                  >
                    {updatingId === order.id ? "Updating…" : section.actionLabel}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
