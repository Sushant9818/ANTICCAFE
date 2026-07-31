"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Promo = {
  id: string;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: string;
  minOrder: string;
  maxRedemptions: number | null;
  timesRedeemed: number;
  isActive: boolean;
  expiresAt: string | null;
};

type Props = {
  initialPromos: Promo[];
};

const emptyForm = {
  code: "",
  description: "",
  discountType: "percent" as "percent" | "flat",
  discountValue: "",
  minOrder: "0",
  maxRedemptions: "",
  expiresAt: "",
};

function isExpired(promo: Promo) {
  return !!promo.expiresAt && new Date(promo.expiresAt) < new Date();
}

export function AdminPromoManager({ initialPromos }: Props) {
  const [promos, setPromos] = useState(initialPromos);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setEditingPromo(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (promo: Promo) => {
    setEditingPromo(promo);
    setForm({
      code: promo.code,
      description: promo.description ?? "",
      discountType: promo.discountType as "percent" | "flat",
      discountValue: promo.discountValue,
      minOrder: promo.minOrder,
      maxRedemptions: promo.maxRedemptions?.toString() ?? "",
      expiresAt: promo.expiresAt ? promo.expiresAt.slice(0, 10) : "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.code || !form.discountValue) {
      toast.error("Code and discount value are required.");
      return;
    }
    setSaving(true);
    try {
      const url = editingPromo
        ? `/api/admin/promos/${editingPromo.id}`
        : "/api/admin/promos";
      const method = editingPromo ? "PUT" : "POST";
      const payload = {
        code: form.code,
        description: form.description,
        discountType: form.discountType,
        discountValue: form.discountValue,
        minOrder: form.minOrder,
        maxRedemptions: form.maxRedemptions ? Number(form.maxRedemptions) : null,
        expiresAt: form.expiresAt || null,
      };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (editingPromo) {
        setPromos((prev) =>
          prev.map((p) =>
            p.id === editingPromo.id
              ? {
                  ...p,
                  code: payload.code.toUpperCase(),
                  description: payload.description || null,
                  discountType: payload.discountType,
                  discountValue: payload.discountValue,
                  minOrder: payload.minOrder,
                  maxRedemptions: payload.maxRedemptions,
                  expiresAt: payload.expiresAt,
                }
              : p
          )
        );
        toast.success("Promo updated");
      } else {
        setPromos((prev) => [
          {
            id: data.id,
            code: data.code,
            description: data.description,
            discountType: data.discount_type,
            discountValue: data.discount_value.toString(),
            minOrder: data.min_order.toString(),
            maxRedemptions: data.max_redemptions,
            timesRedeemed: data.times_redeemed,
            isActive: data.is_active,
            expiresAt: data.expires_at,
          },
          ...prev,
        ]);
        toast.success("Promo created");
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save promo");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (promo: Promo) => {
    try {
      await fetch(`/api/admin/promos/${promo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !promo.isActive }),
      });
      setPromos((prev) =>
        prev.map((p) => (p.id === promo.id ? { ...p, isActive: !p.isActive } : p))
      );
    } catch {
      toast.error("Failed to update promo");
    }
  };

  const deletePromo = async (promo: Promo) => {
    if (!confirm(`Delete promo "${promo.code}"?`)) return;
    try {
      await fetch(`/api/admin/promos/${promo.id}`, { method: "DELETE" });
      setPromos((prev) => prev.filter((p) => p.id !== promo.id));
      toast.success("Promo deleted");
    } catch {
      toast.error("Failed to delete promo");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-end mb-6">
        <Button onClick={openNew} className="bg-amber-700 hover:bg-amber-800 text-white rounded-full flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Promo
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100 text-stone-500">
              <th className="text-left px-5 py-3 font-medium">Code</th>
              <th className="text-left px-5 py-3 font-medium">Discount</th>
              <th className="text-left px-5 py-3 font-medium">Min Order</th>
              <th className="text-left px-5 py-3 font-medium">Redemptions</th>
              <th className="text-left px-5 py-3 font-medium">Expires</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
              <th className="text-right px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {promos.map((promo) => {
              const expired = isExpired(promo);
              return (
                <tr key={promo.id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50">
                  <td className="px-5 py-3">
                    <span className="font-mono font-medium text-stone-900">{promo.code}</span>
                    {promo.description && (
                      <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">{promo.description}</p>
                    )}
                  </td>
                  <td className="px-5 py-3 font-medium">
                    {promo.discountType === "percent"
                      ? `${Number(promo.discountValue)}%`
                      : formatPrice(Number(promo.discountValue))}
                  </td>
                  <td className="px-5 py-3 text-stone-600">{formatPrice(Number(promo.minOrder))}</td>
                  <td className="px-5 py-3 text-stone-600">
                    {promo.timesRedeemed}
                    {promo.maxRedemptions !== null ? ` / ${promo.maxRedemptions}` : ""}
                  </td>
                  <td className="px-5 py-3 text-stone-600">
                    {promo.expiresAt ? new Date(promo.expiresAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        expired
                          ? "bg-red-100 text-red-700"
                          : promo.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-stone-100 text-stone-500"
                      }`}
                    >
                      {expired ? "Expired" : promo.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleActive(promo)}
                        className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
                        title={promo.isActive ? "Deactivate" : "Activate"}
                      >
                        {promo.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => openEdit(promo)}
                        className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deletePromo(promo)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {promos.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-stone-400">
                  No promo codes yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPromo ? "Edit Promo" : "Add Promo Code"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Code *</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="WELCOME10"
                className="mt-1 font-mono"
              />
            </div>

            <div>
              <Label>Description</Label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Shown to customers…"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Discount Type</Label>
                <select
                  value={form.discountType}
                  onChange={(e) =>
                    setForm({ ...form, discountType: e.target.value as "percent" | "flat" })
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="percent">Percent off</option>
                  <option value="flat">Flat amount off</option>
                </select>
              </div>
              <div>
                <Label>{form.discountType === "percent" ? "Percent *" : "Amount *"}</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.discountValue}
                  onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                  placeholder={form.discountType === "percent" ? "10" : "5.00"}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Minimum Order</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.minOrder}
                  onChange={(e) => setForm({ ...form, minOrder: e.target.value })}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Max Redemptions</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.maxRedemptions}
                  onChange={(e) => setForm({ ...form, maxRedemptions: e.target.value })}
                  placeholder="Unlimited"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Expires On</Label>
              <Input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className="mt-1"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-amber-700 hover:bg-amber-800 text-white"
              >
                {saving ? "Saving…" : editingPromo ? "Save Changes" : "Add Promo"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
