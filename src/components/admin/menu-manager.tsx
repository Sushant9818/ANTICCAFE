"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye, EyeOff, Star } from "lucide-react";
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

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number | null;
  isActive: boolean | null;
};

type Item = {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  isAvailable: boolean | null;
  isVegetarian: boolean | null;
  isVegan: boolean | null;
  isGlutenFree: boolean | null;
  isFeatured: boolean | null;
  sortOrder: number | null;
};

type Props = {
  initialCategories: Category[];
  initialItems: Item[];
};

const emptyItem = {
  name: "",
  description: "",
  price: "",
  categoryId: "",
  imageUrl: "",
  isVegetarian: false,
  isVegan: false,
  isGlutenFree: false,
  isFeatured: false,
};

export function AdminMenuManager({ initialCategories, initialItems }: Props) {
  const [categories] = useState(initialCategories);
  const [items, setItems] = useState(initialItems);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [form, setForm] = useState(emptyItem);
  const [saving, setSaving] = useState(false);

  const filtered =
    activeCategory === "all"
      ? items
      : items.filter((i) => i.categoryId === activeCategory);

  const openNew = () => {
    setEditingItem(null);
    setForm({ ...emptyItem, categoryId: categories[0]?.id ?? "" });
    setDialogOpen(true);
  };

  const openEdit = (item: Item) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      description: item.description ?? "",
      price: item.price,
      categoryId: item.categoryId,
      imageUrl: item.imageUrl ?? "",
      isVegetarian: item.isVegetarian ?? false,
      isVegan: item.isVegan ?? false,
      isGlutenFree: item.isGlutenFree ?? false,
      isFeatured: item.isFeatured ?? false,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.categoryId) {
      toast.error("Name, price, and category are required.");
      return;
    }
    setSaving(true);
    try {
      const url = editingItem
        ? `/api/admin/menu/${editingItem.id}`
        : "/api/admin/menu";
      const method = editingItem ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (editingItem) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === editingItem.id
              ? { ...i, ...form, categoryName: categories.find((c) => c.id === form.categoryId)?.name ?? "" }
              : i
          )
        );
        toast.success("Item updated");
      } else {
        setItems((prev) => [
          ...prev,
          {
            ...data,
            categoryName: categories.find((c) => c.id === form.categoryId)?.name ?? "",
          },
        ]);
        toast.success("Item added");
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save item");
    } finally {
      setSaving(false);
    }
  };

  const toggleAvailable = async (item: Item) => {
    try {
      await fetch(`/api/admin/menu/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !item.isAvailable }),
      });
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i
        )
      );
    } catch {
      toast.error("Failed to update availability");
    }
  };

  const deleteItem = async (item: Item) => {
    if (!confirm(`Delete "${item.name}"?`)) return;
    try {
      await fetch(`/api/admin/menu/${item.id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      toast.success("Item deleted");
    } catch {
      toast.error("Failed to delete item");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === "all"
                ? "bg-stone-900 text-white"
                : "bg-white border border-stone-200 text-stone-600"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat.id
                  ? "bg-stone-900 text-white"
                  : "bg-white border border-stone-200 text-stone-600"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
        <Button onClick={openNew} className="bg-amber-700 hover:bg-amber-800 text-white rounded-full flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Item
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100 text-stone-500">
              <th className="text-left px-5 py-3 font-medium">Item</th>
              <th className="text-left px-5 py-3 font-medium">Category</th>
              <th className="text-left px-5 py-3 font-medium">Price</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
              <th className="text-right px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-stone-900">{item.name}</span>
                    {item.isFeatured && (
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">{item.description}</p>
                  )}
                </td>
                <td className="px-5 py-3 text-stone-600">{item.categoryName}</td>
                <td className="px-5 py-3 font-medium">{formatPrice(Number(item.price))}</td>
                <td className="px-5 py-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      item.isAvailable
                        ? "bg-green-100 text-green-700"
                        : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {item.isAvailable ? "Available" : "Hidden"}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => toggleAvailable(item)}
                      className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
                      title={item.isAvailable ? "Hide" : "Show"}
                    >
                      {item.isAvailable ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => openEdit(item)}
                      className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteItem(item)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-10 text-stone-400">
                  No items in this category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Item" : "Add Menu Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Item name"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Description</Label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Brief description…"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Category *</Label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label>Image URL</Label>
              <Input
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://…"
                className="mt-1"
              />
            </div>

            <div className="flex gap-4 flex-wrap">
              {[
                { key: "isVegetarian", label: "Vegetarian" },
                { key: "isVegan", label: "Vegan" },
                { key: "isGlutenFree", label: "Gluten-Free" },
                { key: "isFeatured", label: "Featured" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form[key as keyof typeof form] as boolean}
                    onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                    className="rounded"
                  />
                  {label}
                </label>
              ))}
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
                {saving ? "Saving…" : editingItem ? "Save Changes" : "Add Item"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
