"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

type Props = {
  id: string;
  message: string;
};

const DISMISS_KEY_PREFIX = "anticcafe-promo-dismissed:";

export function PromoBarClient({ id, message }: Props) {
  const [dismissed, setDismissed] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    setDismissed(sessionStorage.getItem(DISMISS_KEY_PREFIX + id) === "1");
  }, [id]);

  if (dismissed || pathname.startsWith("/admin")) return null;

  return (
    <div className="relative bg-amber-700 text-white">
      <div className="container mx-auto flex items-center justify-center gap-3 px-10 py-2 text-sm font-medium text-center">
        <span>{message}</span>
      </div>
      <button
        onClick={() => {
          sessionStorage.setItem(DISMISS_KEY_PREFIX + id, "1");
          setDismissed(true);
        }}
        aria-label="Dismiss promo"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-amber-800 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
