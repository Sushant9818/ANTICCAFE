"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Receipt } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS_COLORS } from "@/lib/constants";

type OrderItem = { id: string; itemName: string; itemPrice: string; quantity: number };

type Order = {
  id: string;
  orderNumber: number;
  customerName: string;
  orderType: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  subtotal: string;
  tax: string;
  discount: string;
  deliveryFee: string;
  tip: string;
  total: string;
  promoCode: string | null;
  refundRequested: boolean;
  createdAt: Date;
  items: OrderItem[];
};

type Props = {
  initialUnpaid: Order[];
  initialPaid: Order[];
};

function OrderCard({
  order,
  onOrderUpdate,
}: {
  order: Order;
  onOrderUpdate: (order: Order) => void;
}) {
  const [promoCode, setPromoCode] = useState("");
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "esewa" | "khalti">("cash");
  const [paying, setPaying] = useState(false);
  const [requestingRefund, setRequestingRefund] = useState(false);
  const [refundReason, setRefundReason] = useState("");

  const applyDiscount = async () => {
    if (!promoCode.trim()) {
      toast.error("Enter a promo code");
      return;
    }
    setApplyingDiscount(true);
    try {
      const res = await fetch(`/api/cashier/orders/${order.id}/discount`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promoCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onOrderUpdate({
        ...order,
        discount: data.discount.toString(),
        tax: data.tax.toString(),
        total: data.total.toString(),
        promoCode: data.promo_code,
      });
      toast.success(`${promoCode.toUpperCase()} applied`);
      setPromoCode("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to apply discount");
    } finally {
      setApplyingDiscount(false);
    }
  };

  const markPaid = async () => {
    setPaying(true);
    try {
      const res = await fetch(`/api/cashier/orders/${order.id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onOrderUpdate({ ...order, paymentStatus: "paid", paymentMethod });
      toast.success(`Order #${order.orderNumber} marked paid`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to process payment");
    } finally {
      setPaying(false);
    }
  };

  const requestRefund = async () => {
    if (!confirm(`Request a refund for order #${order.orderNumber}? An admin will need to approve it.`)) {
      return;
    }
    setRequestingRefund(true);
    try {
      const res = await fetch(`/api/cashier/orders/${order.id}/refund-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: refundReason.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onOrderUpdate({ ...order, refundRequested: true });
      toast.success("Refund requested — waiting on manager approval");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to request refund");
    } finally {
      setRequestingRefund(false);
    }
  };

  return (
    <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-bold text-white">
            #{order.orderNumber}
            <span className="text-stone-500 font-normal capitalize"> · {order.orderType.replace(/_/g, " ")}</span>
          </p>
          <p className="text-sm text-stone-300">{order.customerName}</p>
        </div>
        <div className="flex items-center gap-1.5">
          {order.refundRequested && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-900/40 text-amber-400">
              Refund requested
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

      <div className="border-t border-dashed border-stone-800 pt-3 space-y-1">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-stone-300">
              {item.itemName} × {item.quantity}
            </span>
            <span className="text-stone-500 font-[family-name:var(--font-plex-mono)]">
              {formatPrice(Number(item.itemPrice) * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-stone-800 pt-2 space-y-1 text-sm font-[family-name:var(--font-plex-mono)]">
        <div className="flex justify-between text-stone-400">
          <span className="font-sans">Subtotal</span>
          <span>{formatPrice(Number(order.subtotal))}</span>
        </div>
        {Number(order.discount) > 0 && (
          <div className="flex justify-between text-green-400">
            <span className="font-sans">Discount {order.promoCode ? `(${order.promoCode})` : ""}</span>
            <span>-{formatPrice(Number(order.discount))}</span>
          </div>
        )}
        <div className="flex justify-between text-stone-400">
          <span className="font-sans">Tax</span>
          <span>{formatPrice(Number(order.tax))}</span>
        </div>
        {Number(order.deliveryFee) > 0 && (
          <div className="flex justify-between text-stone-400">
            <span className="font-sans">Delivery</span>
            <span>{formatPrice(Number(order.deliveryFee))}</span>
          </div>
        )}
        {Number(order.tip) > 0 && (
          <div className="flex justify-between text-stone-400">
            <span className="font-sans">Tip</span>
            <span>{formatPrice(Number(order.tip))}</span>
          </div>
        )}
        <div className="flex justify-between font-semibold text-white text-base pt-1 border-t border-dashed border-stone-800">
          <span className="font-sans">Total</span>
          <span>{formatPrice(Number(order.total))}</span>
        </div>
      </div>

      {order.paymentStatus !== "paid" ? (
        <div className="space-y-3 pt-1">
          <div className="flex gap-2">
            <input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Promo code"
              className="flex-1 rounded-lg border border-stone-700 bg-stone-950 px-3 py-1.5 text-sm text-white placeholder:text-stone-500 outline-none focus:border-admin-amber"
            />
            <button
              onClick={applyDiscount}
              disabled={applyingDiscount}
              className="px-3 py-1.5 rounded-lg border border-stone-700 text-stone-300 text-xs font-medium hover:border-admin-amber disabled:opacity-50"
            >
              {applyingDiscount ? "Applying…" : "Apply"}
            </button>
          </div>

          <div className="flex gap-2 flex-wrap">
            {(["cash", "card", "esewa", "khalti"] as const).map((method) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border capitalize transition-colors ${
                  paymentMethod === method
                    ? "bg-admin-amber text-white border-admin-amber"
                    : "border-stone-700 text-stone-300 hover:border-stone-600"
                }`}
              >
                {method}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={markPaid}
              disabled={paying}
              className="flex-1 py-2 rounded-full bg-admin-amber text-white text-sm font-semibold hover:bg-admin-amber/90 disabled:opacity-50"
            >
              {paying ? "Processing…" : `Mark Paid ${formatPrice(Number(order.total))}`}
            </button>
            <Link
              href={`/cashier/orders/${order.id}/receipt`}
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-stone-700 text-stone-300 text-sm hover:border-stone-600"
            >
              <Receipt className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 pt-1">
          {order.refundRequested ? (
            <p className="flex-1 text-sm text-amber-400 py-2 text-center">
              Refund pending manager approval
            </p>
          ) : (
            <div className="flex-1 flex gap-2">
              <input
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Refund reason (optional)"
                className="flex-1 rounded-lg border border-stone-700 bg-stone-950 px-3 py-1.5 text-sm text-white placeholder:text-stone-500 outline-none focus:border-admin-amber"
              />
              <button
                onClick={requestRefund}
                disabled={requestingRefund}
                className="px-3 py-1.5 rounded-full border border-red-900/50 text-red-400 text-xs font-medium hover:bg-red-950/50 disabled:opacity-50 whitespace-nowrap"
              >
                {requestingRefund ? "Requesting…" : "Request Refund"}
              </button>
            </div>
          )}
          <Link
            href={`/cashier/orders/${order.id}/receipt`}
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-stone-700 text-stone-300 text-sm hover:border-stone-600"
          >
            <Receipt className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

export function CashierOrdersList({ initialUnpaid, initialPaid }: Props) {
  const [unpaid, setUnpaid] = useState(initialUnpaid);
  const [paid, setPaid] = useState(initialPaid);
  const [tab, setTab] = useState<"unpaid" | "paid">("unpaid");

  const updateOrder = (updated: Order) => {
    if (updated.paymentStatus === "paid" && unpaid.some((o) => o.id === updated.id)) {
      setUnpaid((prev) => prev.filter((o) => o.id !== updated.id));
      setPaid((prev) => [updated, ...prev]);
      return;
    }
    setUnpaid((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    setPaid((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  };

  const list = tab === "unpaid" ? unpaid : paid;

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("unpaid")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            tab === "unpaid" ? "bg-admin-amber text-white" : "bg-stone-900 border border-stone-800 text-stone-300"
          }`}
        >
          Unpaid ({unpaid.length})
        </button>
        <button
          onClick={() => setTab("paid")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            tab === "paid" ? "bg-admin-amber text-white" : "bg-stone-900 border border-stone-800 text-stone-300"
          }`}
        >
          Paid
        </button>
      </div>

      {list.length === 0 ? (
        <div className="bg-stone-900 rounded-2xl border border-stone-800 p-10 text-center">
          <p className="text-stone-400">
            {tab === "unpaid" ? "No unpaid orders right now." : "No paid orders yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {list.map((order) => (
            <OrderCard key={order.id} order={order} onOrderUpdate={updateOrder} />
          ))}
        </div>
      )}
    </div>
  );
}
