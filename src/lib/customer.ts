import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db";

export async function getCurrentCustomer() {
  const { userId } = await auth();
  if (!userId) return null;

  const existing = await db.customers.findUnique({ where: { clerk_user_id: userId } });
  if (existing) return existing;

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const email = user.primaryEmailAddress?.emailAddress ?? null;
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || null;

  const byEmail = email ? await db.customers.findUnique({ where: { email } }) : null;
  if (byEmail) {
    return db.customers.update({
      where: { id: byEmail.id },
      data: { clerk_user_id: userId, name: byEmail.name ?? name },
    });
  }

  return db.customers.create({
    data: { clerk_user_id: userId, email, name },
  });
}
