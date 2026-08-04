"use client";

import { useState } from "react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

type Item = {
  id: string;
  name: string;
  price: string;
  categoryId: string;
  categoryName: string;
  isAvailable: boolean;
};

type Category = {
  id: string;
  name: string;
};

type Props = {
  initialItems: Item[];
  categories: Category[];
};

export function MenuAvailabilityList({ initialItems, categories }: Props) {
  const [items, setItems] = useState(initialItems);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered =
    activeCategory === "all" ? items : items.filter((i) => i.categoryId === activeCategory);

  const toggleAvailable = async (item: Item) => {
    setUpdatingId(item.id);
    try {
      const res = await fetch(`/api/admin/menu-availability/${item.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !item.isAvailable }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i))
      );
      toast.success(
        item.isAvailable ? `${item.name} marked out of stock` : `${item.name} marked available`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update item");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeCategory === "all"
              ? "bg-admin-amber text-white"
              : "bg-stone-900 border border-stone-800 text-stone-300"
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
                ? "bg-admin-amber text-white"
                : "bg-stone-900 border border-stone-800 text-stone-300"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`flex items-center justify-between gap-3 rounded-xl border p-4 transition-colors ${
              item.isAvailable ? "bg-stone-900 border-stone-800" : "bg-stone-900/50 border-red-900/40"
            }`}
          >
            <div>
              <p className={`font-medium ${item.isAvailable ? "text-white" : "text-stone-500 line-through"}`}>
                {item.name}
              </p>
              <p className="text-xs text-stone-500">{item.categoryName}</p>
              <p className="text-xs text-admin-amber font-[family-name:var(--font-plex-mono)] mt-1">
                {formatPrice(Number(item.price))}
              </p>
            </div>
            <button
              onClick={() => toggleAvailable(item)}
              disabled={updatingId === item.id}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold disabled:opacity-50 ${
                item.isAvailable
                  ? "border border-red-900/50 text-red-400 hover:bg-red-950/50"
                  : "bg-admin-amber text-white hover:bg-admin-amber/90"
              }`}
            >
              {item.isAvailable ? "Mark Unavailable" : "Mark Available"}
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-center py-10 text-stone-500">No items in this category.</p>
        )}
      </div>
    </div>
  );
}
