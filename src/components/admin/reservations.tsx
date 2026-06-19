"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Phone, Calendar, Users } from "lucide-react";

type Reservation = {
  id: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  date: string;
  timeSlot: string;
  partySize: number;
  status: string;
  specialRequests: string | null;
  adminNotes: string | null;
  createdAt: Date | null;
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-stone-100 text-stone-600",
};

export function AdminReservations({ initialReservations }: { initialReservations: Reservation[] }) {
  const [reservations, setReservations] = useState(initialReservations);
  const [filter, setFilter] = useState("pending");

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
      toast.success(`Reservation ${status}`);
    } catch {
      toast.error("Failed to update reservation");
    }
  };

  const filtered =
    filter === "all"
      ? reservations
      : reservations.filter((r) => r.status === filter);

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {["pending", "confirmed", "all"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
              filter === f
                ? "bg-stone-900 text-white"
                : "bg-white border border-stone-200 text-stone-600"
            }`}
          >
            {f === "all" ? "All" : f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-stone-400">No reservations found.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-stone-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-stone-900">{r.customerName}</p>
                  {r.customerPhone && (
                    <a href={`tel:${r.customerPhone}`} className="flex items-center gap-1 text-xs text-stone-500 hover:text-amber-700 mt-0.5">
                      <Phone className="h-3 w-3" /> {r.customerPhone}
                    </a>
                  )}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[r.status] ?? "bg-stone-100 text-stone-700"}`}>
                  {r.status}
                </span>
              </div>

              <div className="flex gap-4 text-sm text-stone-600 mb-3">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-stone-400" />
                  {r.date} at {r.timeSlot}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-stone-400" />
                  {r.partySize} guests
                </span>
              </div>

              {r.specialRequests && (
                <p className="text-xs text-stone-500 italic mb-3">"{r.specialRequests}"</p>
              )}

              {r.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(r.id, "confirmed")}
                    className="flex-1 py-2 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => updateStatus(r.id, "cancelled")}
                    className="flex-1 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
                  >
                    Decline
                  </button>
                </div>
              )}

              {r.status === "confirmed" && (
                <button
                  onClick={() => updateStatus(r.id, "completed")}
                  className="w-full py-2 rounded-xl bg-stone-800 text-white text-sm font-medium hover:bg-stone-900 transition-colors"
                >
                  Mark Completed
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
