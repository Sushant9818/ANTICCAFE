import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AnticCafe — Artisan Coffee & Food",
  description:
    "A cozy neighborhood cafe serving exceptional coffee, fresh pastries, and wholesome meals crafted with love.",
  openGraph: {
    title: "AnticCafe",
    description: "Artisan Coffee & Food",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${geist.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col font-[family-name:var(--font-geist-sans)]">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster richColors position="top-center" />
        </body>
      </html>
    </ClerkProvider>
  );
}
