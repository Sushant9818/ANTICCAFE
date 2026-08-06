import { db } from "@/db";
import { StaffManager } from "@/components/admin/staff-manager";

export const dynamic = "force-dynamic";

export default async function AdminStaffPage() {
  const staffRaw = await db.staff.findMany({ orderBy: { created_at: "desc" } });
  const staff = staffRaw.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    role: s.role,
    isActive: s.is_active,
    createdAt: s.created_at,
  }));

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold text-white font-[family-name:var(--font-fraunces)] mb-2">
        Staff
      </h1>
      <p className="text-stone-400 mb-6">
        Manage who has access to the waiter, kitchen, and cashier tools.
      </p>
      <StaffManager initialStaff={staff} />
    </div>
  );
}
