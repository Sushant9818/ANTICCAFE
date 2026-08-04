"use client";

import { Plus, Leaf, Star } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import type { MenuItem, MenuCategory } from "@/db/schema";

type Props = {
  item: MenuItem & { category: MenuCategory; rating?: number | null; reviewCount?: number };
};

export function MenuItemCard({ item }: Props) {
  const addItem = useCart((s) => s.addItem);

  const handleAdd = () => {
    addItem({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      imageUrl: item.imageUrl,
    });
    toast.success(`${item.name} added to cart`);
  };

  return (
    <div className="group rounded-2xl border border-stone-800 bg-stone-900 overflow-hidden hover:shadow-md hover:shadow-black/30 transition-shadow">
      <div className="h-44 bg-stone-800 flex items-center justify-center overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="text-5xl select-none">☕</div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-white">{item.name}</h3>
          <span className="text-sm font-bold text-amber-400 whitespace-nowrap">
            {formatPrice(Number(item.price))}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <p className="text-xs text-stone-500">{item.category.name}</p>
          {item.reviewCount ? (
            <span className="flex items-center gap-0.5 text-xs text-amber-400">
              <Star className="h-3 w-3 fill-amber-400" />
              {item.rating?.toFixed(1)}
              <span className="text-stone-500">({item.reviewCount})</span>
            </span>
          ) : null}
        </div>

        {item.description && (
          <p className="text-sm text-stone-400 line-clamp-2 mb-3">{item.description}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {item.isVegetarian && (
              <span title="Vegetarian" className="flex items-center gap-0.5 text-[10px] font-medium text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full">
                <Leaf className="h-2.5 w-2.5" /> V
              </span>
            )}
            {item.isVegan && (
              <span className="text-[10px] font-medium text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full">
                VE
              </span>
            )}
            {item.isGlutenFree && (
              <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full">
                GF
              </span>
            )}
          </div>

          <button
            onClick={handleAdd}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-700 text-white text-xs font-medium hover:bg-amber-800 transition-colors"
          >
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>
      </div>
    </div>
  );
}
