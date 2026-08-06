import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { resolveHomePath } from "@/lib/roles";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ path: "/account/orders" });
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const email = user.primaryEmailAddress?.emailAddress;

  const path = await resolveHomePath(email);
  return NextResponse.json({ path });
}
