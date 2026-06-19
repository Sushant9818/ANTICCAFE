import { db } from "@/db";
import { orders, reservations, menuItems } from "@/db/schema";
import { eq, count, sql, gte } from "drizzle-orm";
import { ShoppingBag, CalendarDays, DollarSign, Package } from "lucide-react";
import { formatPrice } from "@/lib/utils";

async function getStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const [
      totalOrders,
      todayOrders,
      pendingOrders,
      pendingReservations,
      todayRevenue,
      activeItems,
    ] = await Promise.all([
      db.select({ count: count() }).from(orders),
      db.select({ count: count() }).from(orders).where(gte(orders.createdAt, today)),
      db.select({ count: count() }).from(orders).where(eq(orders.status, "pending")),
      db.select({ count: count() }).from(reservations).where(eq(reservations.status, "pending")),
      db.select({ total: sql<number>`coalesce(sum(total::numeric), 0)` }).from(orders).where(gte(orders.createdAt, today)),
      db.select({ count: count() }).from(menuItems).where(eq(menuItems.isAvailable, true)),
    ]);

    return {
      totalOrders: totalOrders[0].count,
      todayOrders: todayOrders[0].count,
      pendingOrders: pendingOrders[0].count,
      pendingReservations: pendingReservations[0].count,
      todayRevenue: todayRevenue[0].total,
      activeItems: activeItems[0].count,
    };
  } catch {
    return {
      totalOrders: 0,
      todayOrders: 0,
      pendingOrders: 0,
      pendingReservations: 0,
      todayRevenue: 0,
      activeItems: 0,
    };
  }
}

async function getRecentOrders() {
  try {
    return await db.select().from(orders).orderBy(sql`created_at desc`).limit(5);
  } catch {
    return [];
  }
}

export default async function AdminDashboard() {
  const [stats, recentOrders] = await Promise.all([getStats(), getRecentOrders()]);

  const statCards = [
    {
      label: "Today's Orders",
      value: stats.todayOrders,
      icon: ShoppingBag,
      color: "text-amber-700",
      bg: "bg-amber-50",
    },
    {
      label: "Today's Revenue",
      value: formatPrice(Number(stats.todayRevenue)),
      icon: DollarSign,
      color: "text-green-700",
      bg: "bg-green-50",
    },
    {
      label: "Pending Orders",
      value: stats.pendingOrders,
      icon: Package,
      color: "text-blue-700",
      bg: "bg-blue-50",
    },
    {
      label: "Pending Reservations",
      value: stats.pendingReservations,
      icon: CalendarDays,
      color: "text-purple-700",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-stone-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-stone-200 p-5">
            <div className={`inline-flex p-2 rounded-lg ${bg} mb-3`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-stone-900">{value}</p>
            <p className="text-sm text-stone-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h2 className="font-semibold text-stone-900 mb-4">Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p className="text-stone-400 text-sm">No orders yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-stone-500 border-b border-stone-100">
                <th className="pb-2 font-medium">#</th>
                <th className="pb-2 font-medium">Customer</th>
                <th className="pb-2 font-medium">Type</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-stone-50 last:border-0">
                  <td className="py-2.5 text-stone-500">#{order.orderNumber}</td>
                  <td className="py-2.5 font-medium text-stone-800">{order.customerName}</td>
                  <td className="py-2.5 capitalize text-stone-600">{order.orderType}</td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 capitalize">
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-medium">{formatPrice(Number(order.total))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
