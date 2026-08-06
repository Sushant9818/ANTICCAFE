import { db } from "@/db";

export const dynamic = "force-dynamic";

async function getLogs() {
  try {
    return await db.audit_logs.findMany({ orderBy: { created_at: "desc" }, take: 200 });
  } catch {
    return [];
  }
}

const ACTION_LABELS: Record<string, string> = {
  "refund.approved": "Approved refund",
  "refund.denied": "Denied refund",
  "staff.created": "Added staff member",
  "staff.role_changed": "Changed staff role",
  "staff.activated": "Reactivated staff member",
  "staff.deactivated": "Deactivated staff member",
  "staff.removed": "Removed staff member",
  "order.cancelled": "Cancelled order",
};

export default async function AdminAuditLogPage() {
  const logs = await getLogs();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold text-white font-[family-name:var(--font-fraunces)] mb-2">
        Audit Log
      </h1>
      <p className="text-stone-400 mb-6">A record of sensitive actions taken across the system.</p>

      {logs.length === 0 ? (
        <div className="bg-stone-900 rounded-2xl border border-stone-800 p-10 text-center">
          <p className="text-stone-400">No activity logged yet.</p>
        </div>
      ) : (
        <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-800 text-stone-400">
                <th className="text-left px-5 py-3 font-medium">When</th>
                <th className="text-left px-5 py-3 font-medium">Who</th>
                <th className="text-left px-5 py-3 font-medium">Action</th>
                <th className="text-left px-5 py-3 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-dashed border-stone-800 last:border-0">
                  <td className="px-5 py-3 text-stone-400 font-[family-name:var(--font-plex-mono)] whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString([], {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-white">{log.actor_email}</p>
                    <p className="text-xs text-stone-500 capitalize">{log.actor_role}</p>
                  </td>
                  <td className="px-5 py-3 text-stone-300">
                    {ACTION_LABELS[log.action] ?? log.action}
                  </td>
                  <td className="px-5 py-3 text-stone-500 text-xs max-w-xs truncate">
                    {log.metadata ? JSON.stringify(log.metadata) : "—"}
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
