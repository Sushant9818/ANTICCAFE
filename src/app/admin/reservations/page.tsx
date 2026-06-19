import { db } from "@/db";
import { reservations } from "@/db/schema";
import { desc } from "drizzle-orm";
import { AdminReservations } from "@/components/admin/reservations";

async function getReservations() {
  try {
    return await db.select().from(reservations).orderBy(desc(reservations.createdAt)).limit(100);
  } catch {
    return [];
  }
}

export default async function AdminReservationsPage() {
  const list = await getReservations();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-stone-900 mb-6">Reservations</h1>
      <AdminReservations initialReservations={list} />
    </div>
  );
}
