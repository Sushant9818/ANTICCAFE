import { db } from "@/db";
import { ORDER_STATUS_COLORS } from "@/lib/constants";

export const dynamic = "force-dynamic";

async function getReservations() {
  try {
    return await db.reservations.findMany({
      orderBy: [{ date: "asc" }, { time_slot: "asc" }],
      take: 100,
    });
  } catch {
    return [];
  }
}

export default async function WaiterReservationsPage() {
  const reservations = await getReservations();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold text-white font-[family-name:var(--font-fraunces)] mb-6">
        Reservations
      </h1>

      {reservations.length === 0 ? (
        <div className="bg-stone-900 rounded-xl border border-stone-800 p-10 text-center">
          <p className="text-stone-400">No reservations yet.</p>
        </div>
      ) : (
        <div className="bg-stone-900 rounded-xl border border-stone-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-800 text-stone-400">
                <th className="text-left px-5 py-3 font-medium">Date</th>
                <th className="text-left px-5 py-3 font-medium">Time</th>
                <th className="text-left px-5 py-3 font-medium">Guest</th>
                <th className="text-left px-5 py-3 font-medium">Party</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.id} className="border-b border-dashed border-stone-800 last:border-0">
                  <td className="px-5 py-3 text-white font-[family-name:var(--font-plex-mono)]">
                    {r.date}
                  </td>
                  <td className="px-5 py-3 text-stone-300 font-[family-name:var(--font-plex-mono)]">
                    {r.time_slot}
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-white font-medium">{r.customer_name}</p>
                    {r.customer_phone && <p className="text-xs text-stone-500">{r.customer_phone}</p>}
                  </td>
                  <td className="px-5 py-3 text-stone-300 font-[family-name:var(--font-plex-mono)]">
                    {r.party_size}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                        ORDER_STATUS_COLORS[r.status] ?? "bg-stone-800 text-stone-300"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-stone-400 max-w-xs truncate">
                    {r.special_requests || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
