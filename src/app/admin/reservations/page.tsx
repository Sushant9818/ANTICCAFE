import { db } from "@/db";
import { AdminReservations } from "@/components/admin/reservations";

async function getReservations() {
  try {
    const reservationsRaw = await db.reservations.findMany({
      orderBy: { created_at: "desc" },
      take: 100,
    });
    return reservationsRaw.map((r) => ({
      id: r.id,
      customerId: r.customer_id,
      customerName: r.customer_name,
      customerEmail: r.customer_email,
      customerPhone: r.customer_phone,
      date: r.date,
      timeSlot: r.time_slot,
      partySize: r.party_size,
      status: r.status,
      specialRequests: r.special_requests,
      adminNotes: r.admin_notes,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
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
