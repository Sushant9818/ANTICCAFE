import { clerkClient, clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Table/tab operations are shared between admins and waiters.
const isSharedStaffRoute = createRouteMatcher([
  "/waiter(.*)",
  "/admin/tables(.*)",
  "/api/admin/tables(.*)",
  "/api/admin/tabs(.*)",
]);
const isAdminOnlyRoute = createRouteMatcher(["/admin(.*)", "/api/admin(.*)"]);

function parseEmailList(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export default clerkMiddleware(async (auth, req) => {
  const shared = isSharedStaffRoute(req);
  const adminOnly = !shared && isAdminOnlyRoute(req);
  if (!shared && !adminOnly) return;

  const isApi = req.nextUrl.pathname.startsWith("/api/");
  const { userId } = await auth();

  if (!userId) {
    if (isApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await auth.protect();
    return;
  }

  const adminEmails = parseEmailList(process.env.ADMIN_ALLOWED_EMAILS);
  const waiterEmails = parseEmailList(process.env.WAITER_ALLOWED_EMAILS);

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const email = user.primaryEmailAddress?.emailAddress.toLowerCase();

  const isAdmin = !!email && adminEmails.includes(email);
  const isWaiter = !!email && waiterEmails.includes(email);
  const allowed = shared ? isAdmin || isWaiter : isAdmin;

  if (!allowed) {
    if (isApi) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/", req.url));
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
