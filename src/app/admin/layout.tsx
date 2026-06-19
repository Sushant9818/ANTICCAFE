import { AdminNav } from "@/components/admin/nav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — AnticCafe",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50 flex">
      <AdminNav />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
