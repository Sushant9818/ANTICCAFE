"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";

type Props = {
  item: {
    id: string;
    name: string;
    description: string | null;
    price: string;
    image_url: string | null;
    categoryName: string;
  };
};

export function FeaturedCard({ item }: Props) {
  const addItem = useCart((s) => s.addItem);

  const handleAdd = () => {
    addItem({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      imageUrl: item.image_url,
    });
    toast.success(`${item.name} added to cart`);
  };

  return (
    <div className="group rounded-2xl border border-stone-800 overflow-hidden bg-stone-900 hover:border-amber-700/50 transition-colors">
      <Link href="/menu" className="block h-44 bg-stone-800 flex items-center justify-center overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="text-5xl">☕</div>
        )}
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <Link href="/menu" className="font-semibold text-white group-hover:text-amber-400 transition-colors">
            {item.name}
          </Link>
          <span className="text-sm font-bold text-amber-400 whitespace-nowrap">
            {formatPrice(Number(item.price))}
          </span>
        </div>
        <p className="text-xs text-stone-500 mb-2">{item.categoryName}</p>
        {item.description && (
          <p className="text-sm text-stone-400 line-clamp-2 mb-3">{item.description}</p>
        )}
        <button
          onClick={handleAdd}
          className="flex items-center justify-center gap-1 w-full px-3 py-2 rounded-full bg-amber-700 text-white text-xs font-medium hover:bg-amber-800 transition-colors"
        >
          <Plus className="h-3 w-3" /> Add to Cart
        </button>
      </div>
    </div>
  );
}
