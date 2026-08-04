import { db } from "@/db";
import { ShoppingBag, CalendarDays, DollarSign, Package } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const [
      totalOrders,
      todayOrders,
      pendingOrders,
      pendingReservations,
      todayRevenueResult,
      activeItems,
    ] = await Promise.all([
      db.orders.count(),
      db.orders.count({ where: { created_at: { gte: today } } }),
      db.orders.count({ where: { status: "pending" } }),
      db.reservations.count({ where: { status: "pending" } }),
      db.orders.aggregate({
        _sum: { total: true },
        where: { created_at: { gte: today } },
      }),
      db.menu_items.count({ where: { is_available: true } }),
    ]);

    const todayRevenue = todayRevenueResult._sum.total ?? 0;

    return {
      totalOrders,
      todayOrders,
      pendingOrders,
      pendingReservations,
      todayRevenue: Number(todayRevenue),
      activeItems,
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
    return await db.orders.findMany({
      orderBy: { created_at: "desc" },
      take: 5,
    });
  } catch {
    return [];
  }
}

export default async function AdminDashboard() {
  const [stats, recentOrders] = await Promise.all([getStats(), getRecentOrders()]);

  const statCards = [
    { label: "Today's Orders", value: stats.todayOrders, icon: ShoppingBag },
    { label: "Today's Revenue", value: formatPrice(stats.todayRevenue), icon: DollarSign },
    { label: "Pending Orders", value: stats.pendingOrders, icon: Package },
    { label: "Pending Reservations", value: stats.pendingReservations, icon: CalendarDays },
  ];

  return (
    <div className="p-8">
      <p className="text-xs uppercase tracking-widest text-admin-taupe font-[family-name:var(--font-plex-mono)] mb-1">
        Today · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
      </p>
      <h1 className="text-3xl font-semibold text-white font-[family-name:var(--font-fraunces)] mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="relative bg-stone-900 rounded-xl border border-stone-800 p-5 overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-admin-amber" />
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex p-2 rounded-lg bg-admin-cream">
                <Icon className="h-4 w-4 text-admin-amber" />
              </span>
            </div>
            <p className="text-2xl font-semibold text-white font-[family-name:var(--font-plex-mono)]">
              {value}
            </p>
            <p className="text-xs uppercase tracking-wide text-admin-taupe mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-stone-900 rounded-xl border border-stone-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-[family-name:var(--font-fraunces)] font-semibold text-lg text-white">
            Recent Orders
          </h2>
          <span className="text-xs text-admin-taupe uppercase tracking-wide font-[family-name:var(--font-plex-mono)]">
            Last {recentOrders.length}
          </span>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-admin-taupe text-sm">No orders yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-admin-taupe border-b border-dashed border-stone-700">
                <th className="pb-2 font-medium">#</th>
                <th className="pb-2 font-medium">Customer</th>
                <th className="pb-2 font-medium">Type</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-dashed border-stone-800 last:border-0"
                >
                  <td className="py-2.5 text-admin-taupe font-[family-name:var(--font-plex-mono)]">
                    #{order.order_number}
                  </td>
                  <td className="py-2.5 font-medium text-white">{order.customer_name}</td>
                  <td className="py-2.5 capitalize text-stone-300">
                    {order.order_type.replace(/_/g, " ")}
                  </td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-admin-cream text-admin-amber capitalize">
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-medium font-[family-name:var(--font-plex-mono)] text-white">
                    {formatPrice(Number(order.total))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
