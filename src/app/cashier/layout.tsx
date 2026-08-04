import { CashierNav } from "@/components/admin/cashier-nav";
import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Cashier — AnticCafe",
};

export default function CashierLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${fraunces.variable} ${plexMono.variable} min-h-screen bg-stone-950 text-stone-200 flex print:bg-white`}
    >
      <CashierNav />
      <main className="relative flex-1 overflow-auto bg-stone-950 print:bg-white">
        <div className="absolute inset-0 bg-[url('/images/hero-bg.png')] bg-no-repeat bg-center bg-[length:auto_70%] opacity-[0.06] pointer-events-none print:hidden" />
        <div className="relative">{children}</div>
      </main>
    </div>
  );
}
