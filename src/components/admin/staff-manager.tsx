"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

type Staff = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
};

type Props = {
  initialStaff: Staff[];
};

const ROLES = ["admin", "waiter", "kitchen", "cashier"] as const;

export function StaffManager({ initialStaff }: Props) {
  const [staff, setStaff] = useState(initialStaff);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "waiter" });
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const addStaff = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Enter a name and email");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStaff((prev) => [
        {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          isActive: data.is_active,
          createdAt: data.created_at,
        },
        ...prev,
      ]);
      setForm({ name: "", email: "", role: "waiter" });
      setAdding(false);
      toast.success(`${form.name} added`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add staff member");
    } finally {
      setSaving(false);
    }
  };

  const updateStaff = async (id: string, patch: { role?: string; isActive?: boolean }) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/staff/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStaff((prev) =>
        prev.map((s) => (s.id === id ? { ...s, role: data.role, isActive: data.is_active } : s))
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update staff member");
    } finally {
      setUpdatingId(null);
    }
  };

  const removeStaff = async (s: Staff) => {
    if (!confirm(`Remove ${s.name} from staff?`)) return;
    try {
      const res = await fetch(`/api/admin/staff/${s.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStaff((prev) => prev.filter((x) => x.id !== s.id));
      toast.success(`${s.name} removed`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove staff member");
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-6">
        {adding ? (
          <div className="flex items-center gap-2 flex-wrap">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Name"
              className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-white placeholder:text-stone-500 outline-none focus:border-admin-amber"
            />
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email"
              type="email"
              className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-white placeholder:text-stone-500 outline-none focus:border-admin-amber"
            />
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-white outline-none focus:border-admin-amber capitalize"
            >
              {ROLES.map((r) => (
                <option key={r} value={r} className="capitalize">
                  {r}
                </option>
              ))}
            </select>
            <button
              onClick={addStaff}
              disabled={saving}
              className="px-4 py-2 rounded-full bg-admin-amber text-white text-sm font-medium hover:bg-admin-amber/90 disabled:opacity-50"
            >
              {saving ? "Adding…" : "Add"}
            </button>
            <button
              onClick={() => setAdding(false)}
              className="px-4 py-2 rounded-full border border-stone-700 text-stone-300 text-sm"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-admin-amber text-white text-sm font-medium hover:bg-admin-amber/90"
          >
            <Plus className="h-4 w-4" /> Add Staff
          </button>
        )}
      </div>

      <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-800 text-stone-400">
              <th className="text-left px-5 py-3 font-medium">Name</th>
              <th className="text-left px-5 py-3 font-medium">Email</th>
              <th className="text-left px-5 py-3 font-medium">Role</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
              <th className="text-right px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id} className="border-b border-dashed border-stone-800 last:border-0">
                <td className="px-5 py-3 font-medium text-white">{s.name}</td>
                <td className="px-5 py-3 text-stone-300">{s.email}</td>
                <td className="px-5 py-3">
                  <select
                    value={s.role}
                    onChange={(e) => updateStaff(s.id, { role: e.target.value })}
                    disabled={updatingId === s.id}
                    className="rounded-lg border border-stone-700 bg-stone-950 px-2 py-1 text-xs text-white outline-none focus:border-admin-amber capitalize disabled:opacity-50"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r} className="capitalize">
                        {r}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => updateStaff(s.id, { isActive: !s.isActive })}
                    disabled={updatingId === s.id}
                    className={`px-2 py-0.5 rounded-full text-xs font-medium disabled:opacity-50 ${
                      s.isActive ? "bg-green-900/40 text-green-400" : "bg-stone-800 text-stone-400"
                    }`}
                  >
                    {s.isActive ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end">
                    <button
                      onClick={() => removeStaff(s)}
                      className="p-1.5 rounded-lg hover:bg-red-950/50 text-stone-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {staff.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-10 text-stone-500">
                  No staff added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
