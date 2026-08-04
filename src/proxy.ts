import { clerkClient, clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

function parseEmailList(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

// Each group: routes shared between admins and that role. Checked in order —
// the first matching group decides the required role(s) for the request.
const roleGroups = [
  {
    envVar: "WAITER_ALLOWED_EMAILS",
    matcher: createRouteMatcher([
      "/waiter(.*)",
      "/admin/tables(.*)",
      "/api/admin/tables(.*)",
      "/api/admin/tabs(.*)",
    ]),
  },
  {
    envVar: "KITCHEN_ALLOWED_EMAILS",
    matcher: createRouteMatcher([
      "/kitchen(.*)",
      "/api/admin/orders/(.*)",
      "/api/admin/menu-availability(.*)",
    ]),
  },
  {
    envVar: "CASHIER_ALLOWED_EMAILS",
    matcher: createRouteMatcher(["/cashier(.*)", "/api/cashier(.*)"]),
  },
];

const isAdminOnlyRoute = createRouteMatcher(["/admin(.*)", "/api/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const matchedGroup = roleGroups.find((g) => g.matcher(req));
  const adminOnly = !matchedGroup && isAdminOnlyRoute(req);
  if (!matchedGroup && !adminOnly) return;

  const isApi = req.nextUrl.pathname.startsWith("/api/");
  const { userId } = await auth();

  if (!userId) {
    if (isApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await auth.protect();
    return;
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const email = user.primaryEmailAddress?.emailAddress.toLowerCase();

  const isAdmin = !!email && parseEmailList(process.env.ADMIN_ALLOWED_EMAILS).includes(email);
  const hasRole =
    !!matchedGroup && !!email && parseEmailList(process.env[matchedGroup.envVar]).includes(email);

  const allowed = matchedGroup ? isAdmin || hasRole : isAdmin;

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
