"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { RestaurantSettings } from "@/lib/settings";

export function SettingsForm({ initialSettings }: { initialSettings: RestaurantSettings }) {
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);

  const save = async (patch: Partial<RestaurantSettings>) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSettings(data);
      toast.success("Settings saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-stone-900 rounded-2xl border border-stone-800 p-6 max-w-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-white">Accepting Orders</p>
          <p className="text-xs text-stone-500">
            Turn off to pause new checkout orders (e.g. closed for the day).
          </p>
        </div>
        <button
          onClick={() => save({ acceptingOrders: !settings.acceptingOrders })}
          disabled={saving}
          className={`px-4 py-2 rounded-full text-sm font-medium disabled:opacity-50 ${
            settings.acceptingOrders
              ? "bg-green-900/40 text-green-400"
              : "border border-red-900/50 text-red-400"
          }`}
        >
          {settings.acceptingOrders ? "Open" : "Closed"}
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-1.5">Hours Note</label>
        <input
          value={settings.hoursNote}
          onChange={(e) => setSettings({ ...settings, hoursNote: e.target.value })}
          onBlur={() => save({ hoursNote: settings.hoursNote })}
          placeholder="e.g. Open daily 7am – 9pm"
          className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-white placeholder:text-stone-500 outline-none focus:border-admin-amber"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-1.5">Delivery Note</label>
        <input
          value={settings.deliveryNote}
          onChange={(e) => setSettings({ ...settings, deliveryNote: e.target.value })}
          onBlur={() => save({ deliveryNote: settings.deliveryNote })}
          placeholder="e.g. Delivery within 5 miles only"
          className="w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-white placeholder:text-stone-500 outline-none focus:border-admin-amber"
        />
      </div>
    </div>
  );
}
