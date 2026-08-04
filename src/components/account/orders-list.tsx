"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Star, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS_COLORS } from "@/lib/constants";

type OrderItem = {
  id: string;
  menuItemId: string | null;
  itemName: string;
  itemPrice: string;
  quantity: number;
};

type Order = {
  id: string;
  orderNumber: number;
  orderType: string;
  status: string;
  total: string;
  createdAt: Date;
  items: OrderItem[];
};

type Props = {
  orders: Order[];
  reviewedItemIds: string[];
};

type ReviewTarget = { orderId: string; menuItemId: string; itemName: string };

export function OrdersList({ orders: initialOrders, reviewedItemIds: initialReviewed }: Props) {
  const [orders, setOrders] = useState(initialOrders);
  const [reviewedItemIds, setReviewedItemIds] = useState(new Set(initialReviewed));
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [reviewTarget, setReviewTarget] = useState<ReviewTarget | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const cancelOrder = async (id: string) => {
    if (!confirm("Cancel this order?")) return;
    setCancellingId(id);
    try {
      const res = await fetch(`/api/account/orders/${id}/cancel`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "cancelled" } : o)));
      toast.success("Order cancelled");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel order");
    } finally {
      setCancellingId(null);
    }
  };

  const openReview = (target: ReviewTarget) => {
    setReviewTarget(target);
    setRating(5);
    setComment("");
  };

  const submitReview = async () => {
    if (!reviewTarget) return;
    setSubmittingReview(true);
    try {
      const res = await fetch("/api/account/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: reviewTarget.orderId,
          menuItemId: reviewTarget.menuItemId,
          rating,
          comment: comment.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReviewedItemIds((prev) => new Set(prev).add(reviewTarget.menuItemId));
      toast.success("Review submitted");
      setReviewTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="bg-stone-900 rounded-2xl border border-stone-800 p-10 text-center">
        <p className="text-stone-400">You haven&apos;t placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="bg-stone-900 rounded-2xl border border-stone-800 p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-bold text-white">
                #{order.orderNumber}
                <span className="text-stone-500 font-normal capitalize"> · {order.orderType.replace(/_/g, " ")}</span>
              </p>
              <p className="text-xs text-stone-500">
                {new Date(order.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                ORDER_STATUS_COLORS[order.status] ?? "bg-stone-800 text-stone-300"
              }`}
            >
              {order.status.replace(/_/g, " ")}
            </span>
          </div>

          <div className="border-t border-stone-800 pt-3 space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-stone-300">
                  {item.itemName} × {item.quantity}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-stone-500">{formatPrice(Number(item.itemPrice) * item.quantity)}</span>
                  {order.status === "delivered" && item.menuItemId && (
                    reviewedItemIds.has(item.menuItemId) ? (
                      <span className="text-xs text-green-500">Reviewed</span>
                    ) : (
                      <button
                        onClick={() =>
                          openReview({ orderId: order.id, menuItemId: item.menuItemId!, itemName: item.itemName })
                        }
                        className="text-xs text-amber-400 hover:text-amber-300 font-medium"
                      >
                        Leave a review
                      </button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-stone-800 mt-3 pt-3 flex items-center justify-between">
            <p className="font-semibold text-white text-sm">Total {formatPrice(Number(order.total))}</p>
            {order.status === "pending" && (
              <button
                onClick={() => cancelOrder(order.id)}
                disabled={cancellingId === order.id}
                className="px-3 py-1.5 rounded-full border border-red-900/50 text-red-400 text-xs font-medium hover:bg-red-950/50 disabled:opacity-50"
              >
                {cancellingId === order.id ? "Cancelling…" : "Cancel Order"}
              </button>
            )}
          </div>
        </div>
      ))}

      {reviewTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-semibold text-white">Review {reviewTarget.itemName}</h2>
              <button onClick={() => setReviewTarget(null)} className="text-stone-500 hover:text-stone-300">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-stone-500 mb-4">How was it?</p>

            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setRating(n)} aria-label={`${n} stars`}>
                  <Star
                    className={`h-7 w-7 ${n <= rating ? "text-amber-400 fill-amber-400" : "text-stone-700"}`}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts (optional)…"
              rows={3}
              className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-white placeholder:text-stone-500 resize-none outline-none focus:border-amber-500 mb-4"
            />

            <button
              onClick={submitReview}
              disabled={submittingReview}
              className="w-full py-2.5 rounded-full bg-amber-700 text-white text-sm font-semibold hover:bg-amber-800 disabled:opacity-50"
            >
              {submittingReview ? "Submitting…" : "Submit Review"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
