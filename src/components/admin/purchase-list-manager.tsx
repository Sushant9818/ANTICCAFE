"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Check, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";

type PurchaseItem = {
  id: string;
  itemName: string;
  quantity: string | null;
  price: string | null;
  note: string | null;
  status: string;
  addedBy: string | null;
  createdAt: string;
  boughtAt: string | null;
};

type Props = {
  initialItems: PurchaseItem[];
};

function sumPrice(items: PurchaseItem[]) {
  return items.reduce((total, i) => total + (i.price ? Number(i.price) : 0), 0);
}

export function PurchaseListManager({ initialItems }: Props) {
  const [items, setItems] = useState(initialItems);
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");
  const [adding, setAdding] = useState(false);

  const pending = items.filter((i) => i.status === "pending");
  const bought = items.filter((i) => i.status === "bought");

  const addItem = async () => {
    if (!itemName.trim()) {
      toast.error("Item name is required.");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/admin/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemName: itemName.trim(),
          quantity: quantity.trim(),
          price: price.trim(),
          note: note.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setItems((prev) => [
        {
          id: data.id,
          itemName: data.item_name,
          quantity: data.quantity,
          price: data.price,
          note: data.note,
          status: data.status,
          addedBy: data.added_by,
          createdAt: data.created_at,
          boughtAt: data.bought_at,
        },
        ...prev,
      ]);
      setItemName("");
      setQuantity("");
      setPrice("");
      setNote("");
      toast.success("Item added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add item");
    } finally {
      setAdding(false);
    }
  };

  const setStatus = async (item: PurchaseItem, status: "pending" | "bought") => {
    try {
      const res = await fetch(`/api/admin/purchases/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: updated.status, boughtAt: updated.bought_at } : i))
      );
    } catch {
      toast.error("Failed to update item");
    }
  };

  const removeItem = async (item: PurchaseItem) => {
    if (!confirm(`Remove "${item.itemName}"?`)) return;
    try {
      await fetch(`/api/admin/purchases/${item.id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      toast.success("Item removed");
    } catch {
      toast.error("Failed to remove item");
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl border border-stone-200 p-5">
        <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-4">Add Item</h2>
        <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_2fr_auto] gap-3">
          <Input
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Item (e.g. Coffee beans)"
          />
          <Input value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Quantity" />
          <Input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price"
          />
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" />
          <Button
            onClick={addItem}
            disabled={adding}
            className="bg-amber-700 hover:bg-amber-800 text-white rounded-full flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide">
            Needed ({pending.length})
          </h2>
          {sumPrice(pending) > 0 && (
            <span className="text-sm font-medium text-stone-500">Est. {formatPrice(sumPrice(pending))}</span>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {pending.map((item) => (
                <tr key={item.id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50">
                  <td className="px-5 py-3">
                    <span className="font-medium text-stone-900">{item.itemName}</span>
                    {item.quantity && <span className="text-stone-400 ml-2">× {item.quantity}</span>}
                    {item.price && (
                      <span className="text-stone-500 ml-2 font-medium">{formatPrice(Number(item.price))}</span>
                    )}
                    {item.note && <p className="text-xs text-stone-400 mt-0.5">{item.note}</p>}
                  </td>
                  <td className="px-5 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setStatus(item, "bought")}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-medium hover:bg-green-100 transition-colors"
                      >
                        <Check className="h-3.5 w-3.5" /> Mark Bought
                      </button>
                      <button
                        onClick={() => removeItem(item)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pending.length === 0 && (
                <tr>
                  <td className="text-center py-10 text-stone-400">Nothing needed right now.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {bought.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide">
              Bought ({bought.length})
            </h2>
            {sumPrice(bought) > 0 && (
              <span className="text-sm font-medium text-stone-500">Spent {formatPrice(sumPrice(bought))}</span>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {bought.map((item) => (
                  <tr key={item.id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50">
                    <td className="px-5 py-3">
                      <span className="font-medium text-stone-500 line-through">{item.itemName}</span>
                      {item.quantity && <span className="text-stone-400 ml-2">× {item.quantity}</span>}
                      {item.price && (
                        <span className="text-stone-400 ml-2">{formatPrice(Number(item.price))}</span>
                      )}
                      {item.boughtAt && (
                        <span className="text-xs text-stone-400 ml-2">
                          on {new Date(item.boughtAt).toLocaleDateString()}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setStatus(item, "pending")}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-stone-200 text-stone-500 text-xs font-medium hover:bg-stone-50 transition-colors"
                        >
                          <RotateCcw className="h-3.5 w-3.5" /> Reopen
                        </button>
                        <button
                          onClick={() => removeItem(item)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
