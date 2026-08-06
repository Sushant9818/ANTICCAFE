import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db";

export async function getCurrentActor() {
  const { userId } = await auth();
  if (!userId) return null;

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const email = user.primaryEmailAddress?.emailAddress.toLowerCase();
  if (!email) return null;

  const adminEmails = (process.env.ADMIN_ALLOWED_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (adminEmails.includes(email)) return { email, role: "admin" };

  const staffRecord = await db.staff.findUnique({ where: { email }, select: { role: true } });
  return { email, role: staffRecord?.role ?? "unknown" };
}

export async function logAction(params: {
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}) {
  const actor = await getCurrentActor();
  await db.audit_logs.create({
    data: {
      actor_email: actor?.email ?? "unknown",
      actor_role: actor?.role ?? "unknown",
      action: params.action,
      target_type: params.targetType,
      target_id: params.targetId ?? null,
      metadata: params.metadata as never,
    },
  });
}
