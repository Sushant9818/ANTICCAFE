"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChefHat, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/kitchen", label: "Orders", icon: ChefHat, exact: true },
  { href: "/kitchen/menu", label: "Menu", icon: UtensilsCrossed },
];

export function KitchenNav() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-admin-ink text-stone-400 flex flex-col shrink-0 min-h-screen">
      <div className="flex items-center p-5 border-b border-white/10">
        <Image
          src="/logo.svg"
          alt="AnticCafe"
          width={110}
          height={36}
          className="h-8 w-auto brightness-0 invert"
        />
      </div>
      <p className="text-[10px] text-admin-taupe px-5 pt-4 pb-1 uppercase tracking-widest font-[family-name:var(--font-plex-mono)]">
        Kitchen
      </p>
      <nav className="flex-1 px-2 pb-4">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors my-0.5",
                active
                  ? "bg-admin-amber text-white"
                  : "hover:bg-white/5 text-stone-400 hover:text-stone-200"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10">
        <Link href="/" className="text-xs text-admin-taupe hover:text-stone-300 transition-colors">
          ← Back to site
        </Link>
      </div>
    </aside>
  );
}
