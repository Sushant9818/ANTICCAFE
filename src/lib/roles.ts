import { db } from "@/db";

function parseEmailList(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export type UserRoles = {
  isAdmin: boolean;
  isWaiter: boolean;
  isKitchen: boolean;
  isCashier: boolean;
  isDriver: boolean;
};

export async function getUserRoles(email: string): Promise<UserRoles> {
  const staffRecord = await db.staff.findUnique({
    where: { email },
    select: { role: true, is_active: true },
  });
  const hasStaffRole = (role: string) => !!staffRecord?.is_active && staffRecord.role === role;

  return {
    isAdmin: parseEmailList(process.env.ADMIN_ALLOWED_EMAILS).includes(email) || hasStaffRole("admin"),
    isWaiter: parseEmailList(process.env.WAITER_ALLOWED_EMAILS).includes(email) || hasStaffRole("waiter"),
    isKitchen: parseEmailList(process.env.KITCHEN_ALLOWED_EMAILS).includes(email) || hasStaffRole("kitchen"),
    isCashier: parseEmailList(process.env.CASHIER_ALLOWED_EMAILS).includes(email) || hasStaffRole("cashier"),
    isDriver: parseEmailList(process.env.DRIVER_ALLOWED_EMAILS).includes(email) || hasStaffRole("driver"),
  };
}

export async function resolveHomePath(email: string | null | undefined): Promise<string> {
  if (!email) return "/account/orders";
  const roles = await getUserRoles(email.toLowerCase());
  if (roles.isAdmin) return "/admin";
  if (roles.isWaiter) return "/waiter/tables";
  if (roles.isKitchen) return "/kitchen";
  if (roles.isCashier) return "/cashier";
  if (roles.isDriver) return "/driver";
  return "/account/orders";
}
