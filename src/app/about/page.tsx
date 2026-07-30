import type { Metadata } from "next";
import { CAFE_NAME, CAFE_ADDRESS, CAFE_PHONE, CAFE_HOURS } from "@/lib/constants";
import Link from "next/link";

export const metadata: Metadata = {
  title: `About — ${CAFE_NAME}`,
  description: `Learn about ${CAFE_NAME}, our story, values, and the team behind your daily cup.`,
};

export default function AboutPage() {
  return (
    <div className="bg-stone-950 min-h-screen">
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-4xl font-bold text-white mb-4">{CAFE_NAME}</h1>
        <p className="text-lg text-stone-300 mb-10 leading-relaxed">
          We started AnticCafe with one simple belief: a great cup of coffee and a warm meal
          can transform your day. What began as a small corner shop has grown into a beloved
          neighborhood gathering place — but our commitment to quality and community has
          never wavered.
        </p>

        <div className="max-w-none mb-12">
          <h2 className="text-2xl font-bold text-white mb-3">Our Story</h2>
          <p className="text-stone-400 leading-relaxed mb-6">
            Founded by coffee enthusiasts and food lovers, AnticCafe was born out of a
            desire to create a space where everyone feels welcome. We source our beans from
            small, sustainable farms, bake fresh every morning, and cook every dish from
            scratch using seasonal, locally-sourced ingredients.
          </p>

          <h2 className="text-2xl font-bold text-white mb-3">What We Believe</h2>
          <ul className="space-y-2 text-stone-400 mb-6 list-none pl-0">
            {[
              "Quality over quantity — we'd rather do fewer things exceptionally well",
              "Community matters — this space belongs to the neighborhood",
              "Sustainability guides every decision we make",
              "Every person who walks through our door deserves to feel at home",
            ].map((b) => (
              <li key={b} className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">✦</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-4">Find Us</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-stone-300">
            <div>
              <p className="font-semibold text-white mb-1">Address</p>
              <p>{CAFE_ADDRESS}</p>
            </div>
            <div>
              <p className="font-semibold text-white mb-1">Phone</p>
              <a href={`tel:${CAFE_PHONE}`} className="hover:text-amber-400 transition-colors">
                {CAFE_PHONE}
              </a>
            </div>
            <div>
              <p className="font-semibold text-white mb-1">Weekdays</p>
              <p>{CAFE_HOURS.weekdays}</p>
            </div>
            <div>
              <p className="font-semibold text-white mb-1">Weekends</p>
              <p>{CAFE_HOURS.weekends}</p>
            </div>
          </div>
          <div className="mt-6">
            <Link
              href="/menu"
              className="inline-flex items-center px-5 py-2.5 rounded-full bg-amber-700 text-white text-sm font-medium hover:bg-amber-800 transition-colors"
            >
              Order Online
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
