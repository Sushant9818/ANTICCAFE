"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/account/orders", label: "Orders" },
  { href: "/account/profile", label: "Profile" },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <div className="flex gap-2 mb-8">
      {tabs.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              active
                ? "bg-amber-700 text-white"
                : "bg-stone-900 border border-stone-800 text-stone-300 hover:bg-stone-800"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
