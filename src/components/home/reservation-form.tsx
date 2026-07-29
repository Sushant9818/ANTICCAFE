"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function ReservationForm() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    date: "",
    timeSlot: "",
    partySize: "2",
    specialRequests: "",
  });

  const timeSlots = [
    "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM",
    "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to submit");
      toast.success("Reservation request submitted! We'll confirm shortly.");
      setForm({
        customerName: "", customerEmail: "", customerPhone: "",
        date: "", timeSlot: "", partySize: "2", specialRequests: "",
      });
    } catch {
      toast.error("Something went wrong. Please call us to book.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="reservations" className="py-20 bg-stone-900">
      <div className="container mx-auto px-4 max-w-xl">
        <div className="text-center mb-10">
          <p className="text-sm font-medium text-amber-400 uppercase tracking-wider mb-2">
            Reserve a Table
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Join us for a meal
          </h2>
          <p className="text-stone-400 mt-2 text-sm">
            Book ahead to secure your spot. We'll confirm within a few hours.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm border border-stone-200 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                required
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                placeholder="Your name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={form.customerPhone}
                onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                placeholder="(555) 000-0000"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.customerEmail}
              onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
              placeholder="you@email.com"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                required
                min={new Date().toISOString().split("T")[0]}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="time">Time *</Label>
              <select
                id="time"
                required
                value={form.timeSlot}
                onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select time</option>
                {timeSlots.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="party">Guests *</Label>
              <Input
                id="party"
                type="number"
                required
                min="1"
                max="20"
                value={form.partySize}
                onChange={(e) => setForm({ ...form, partySize: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="requests">Special Requests</Label>
            <textarea
              id="requests"
              rows={2}
              value={form.specialRequests}
              onChange={(e) => setForm({ ...form, specialRequests: e.target.value })}
              placeholder="Dietary needs, occasion, etc."
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-700 hover:bg-amber-800 text-white rounded-full"
          >
            {loading ? "Submitting…" : "Request Reservation"}
          </Button>
        </form>
      </div>
    </section>
  );
}
