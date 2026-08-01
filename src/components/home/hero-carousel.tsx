"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";

type Item = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
};

type Props = {
  items: Item[];
};

const AUTO_ADVANCE_MS = 3500;

export function HeroCarousel({ items }: Props) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (items.length < 2) return;
    const id = setInterval(() => {
      setActive((i) => (i + 1) % items.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <div className="w-full max-w-md ml-auto">
      <div
        className="relative h-[26rem] md:h-[32rem]"
        style={{ perspective: "1200px" }}
      >
        {items.map((item, i) => {
          let offset = i - active;
          const half = items.length / 2;
          if (offset > half) offset -= items.length;
          if (offset < -half) offset += items.length;

          const abs = Math.abs(offset);
          const hidden = abs > 2;

          const translateX = offset * 155;
          const scale = abs === 0 ? 1 : abs === 1 ? 0.78 : 0.6;
          const rotateY = offset === 0 ? 0 : offset > 0 ? -22 : 22;
          const opacity = abs === 0 ? 1 : abs === 1 ? 0.65 : 0.3;
          const zIndex = 10 - abs;

          return (
            <button
              key={item.id}
              onClick={() => setActive(i)}
              aria-label={`Show ${item.name}`}
              className={`absolute left-1/2 top-1/2 w-64 md:w-72 rounded-2xl overflow-hidden border transition-all duration-500 ease-out text-left ${
                offset === 0
                  ? "border-amber-500 shadow-[0_0_30px_rgba(217,119,6,0.4)]"
                  : "border-stone-800"
              } ${hidden ? "pointer-events-none" : ""}`}
              style={{
                transform: `translate(-50%, -50%) translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`,
                opacity: hidden ? 0 : opacity,
                zIndex,
              }}
            >
              <div className="h-48 md:h-56 bg-stone-800 flex items-center justify-center">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-6xl">☕</span>
                )}
              </div>
              <div className="bg-stone-900 p-4">
                <p className="font-semibold text-white text-base truncate">{item.name}</p>
                {item.description && (
                  <p className="text-xs text-stone-400 italic truncate">{item.description}</p>
                )}
                <p className="text-amber-400 text-sm font-bold mt-1">
                  {formatPrice(Number(item.price))}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-2 mt-6">
        {items.map((item, i) => (
          <button
            key={item.id}
            onClick={() => setActive(i)}
            aria-label={`Go to ${item.name}`}
            className={`h-1.5 rounded-full transition-all ${
              i === active ? "w-6 bg-amber-500" : "w-1.5 bg-stone-700"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
