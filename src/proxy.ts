import { clerkClient, clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserRoles, type UserRoles } from "@/lib/roles";

// Each group: routes shared between admins and that role. Checked in order —
// the first matching group decides the required role for the request.
const roleGroups: { check: (r: UserRoles) => boolean; matcher: ReturnType<typeof createRouteMatcher> }[] = [
  {
    check: (r) => r.isWaiter,
    matcher: createRouteMatcher([
      "/waiter(.*)",
      "/admin/tables(.*)",
      "/api/admin/tables(.*)",
      "/api/admin/tabs(.*)",
    ]),
  },
  {
    check: (r) => r.isKitchen,
    matcher: createRouteMatcher(["/kitchen(.*)", "/api/admin/menu-availability(.*)"]),
  },
  {
    check: (r) => r.isCashier,
    matcher: createRouteMatcher(["/cashier(.*)", "/api/cashier(.*)"]),
  },
  {
    check: (r) => r.isDriver,
    matcher: createRouteMatcher(["/driver(.*)"]),
  },
  // Order status updates are shared between admin, kitchen, and drivers.
  {
    check: (r) => r.isKitchen || r.isDriver,
    matcher: createRouteMatcher(["/api/admin/orders/(.*)"]),
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

  const roles = email
    ? await getUserRoles(email)
    : { isAdmin: false, isWaiter: false, isKitchen: false, isCashier: false, isDriver: false };

  const allowed = matchedGroup ? roles.isAdmin || matchedGroup.check(roles) : roles.isAdmin;

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
