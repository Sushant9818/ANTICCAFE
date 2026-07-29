"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/lib/cart-store";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const itemCount = useCart((s) => s.itemCount());

  useEffect(() => { setMounted(true); }, []);

  const links = [
    { href: "/", label: "Home" },
    { href: "/menu", label: "Menu" },
    { href: "/about", label: "About" },
    { href: "/#reservations", label: "Reservations" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-800 bg-stone-950">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.svg"
            alt="AnticCafe"
            width={130}
            height={42}
            priority
            className="h-10 w-auto brightness-0 invert"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-stone-300 hover:text-amber-400 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="relative p-2 rounded-full hover:bg-stone-800 transition-colors"
            aria-label="Cart"
          >
            <ShoppingCart className="h-5 w-5 text-stone-300" />
            {mounted && itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-700 text-[10px] font-bold text-white">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </Link>

          <Link
            href="/menu"
            className="hidden md:inline-flex items-center px-4 py-2 rounded-full bg-amber-700 text-white text-sm font-medium hover:bg-amber-800 transition-colors"
          >
            Order Now
          </Link>

          <button
            className="md:hidden p-2 rounded-md hover:bg-stone-800"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5 text-stone-300" /> : <Menu className="h-5 w-5 text-stone-300" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-stone-800 bg-stone-950 px-4 py-4 space-y-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block text-sm font-medium text-stone-300 py-1"
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/menu"
            className="block w-full text-center px-4 py-2 rounded-full bg-amber-700 text-white text-sm font-medium"
            onClick={() => setMobileOpen(false)}
          >
            Order Now
          </Link>
        </div>
      )}
    </header>
  );
}
