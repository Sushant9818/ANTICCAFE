"use client";

import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-stone-950">
      <div className="absolute inset-0 bg-[url('/images/hero-bg.png')] bg-no-repeat bg-center bg-[length:auto_85%] opacity-[0.08] brightness-0 invert" />

      <div className="relative container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
            ))}
            <span className="text-sm text-stone-400 ml-1">Loved by our community</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
            Mornings taste better{" "}
            <span className="text-amber-400">at AnticCafe</span>
          </h1>

          <p className="text-lg text-stone-400 mb-8 leading-relaxed max-w-xl">
            Breakfast & brunch done right — fresh morning plates, artisan coffee,
            and a cozy corner in Bhaktapur that feels like home.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/menu"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-amber-700 text-white font-semibold hover:bg-amber-800 transition-colors"
            >
              Order Online
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/menu"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 border-stone-700 text-stone-300 font-semibold hover:border-stone-500 transition-colors"
            >
              View Menu
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-amber-900/40 rounded-full blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-stone-800 rounded-full blur-2xl opacity-60" />
    </section>
  );
}
