"use client";

import { usePathname } from "next/navigation";

type Props = {
  messages: string[];
};

export function PromoBarClient({ messages }: Props) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  const totalLength = messages.join("").length;
  const duration = Math.max(8, totalLength * 0.2);

  return (
    <div className="sticky top-16 z-40 bg-amber-700 text-white overflow-hidden h-9 flex items-center">
      <div
        className="flex items-center whitespace-nowrap text-sm font-medium animate-marquee-rtl"
        style={{ animationDuration: `${duration}s` }}
      >
        {messages.map((msg, i) => (
          <span key={i} className="flex items-center">
            <span>{msg}</span>
            <span className="mx-10 opacity-60">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}
