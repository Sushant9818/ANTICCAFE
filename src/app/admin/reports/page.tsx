import { db } from "@/db";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getReportData() {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(startOfToday);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const thirtyDaysAgo = new Date(startOfToday);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

  try {
    const [todayRevenue, sevenDayRevenue, thirtyDayRevenue, recentPaidOrders, statusCounts] =
      await Promise.all([
        db.orders.aggregate({
          _sum: { total: true },
          where: { payment_status: "paid", created_at: { gte: startOfToday } },
        }),
        db.orders.aggregate({
          _sum: { total: true },
          where: { payment_status: "paid", created_at: { gte: sevenDaysAgo } },
        }),
        db.orders.aggregate({
          _sum: { total: true },
          where: { payment_status: "paid", created_at: { gte: thirtyDaysAgo } },
        }),
        db.orders.findMany({
          where: { payment_status: "paid", created_at: { gte: thirtyDaysAgo } },
          select: { total: true, created_at: true },
        }),
        db.orders.groupBy({ by: ["status"], _count: { status: true } }),
      ]);

    const dailyMap = new Map<string, number>();
    for (const o of recentPaidOrders) {
      const key = o.created_at.toISOString().slice(0, 10);
      dailyMap.set(key, (dailyMap.get(key) ?? 0) + Number(o.total));
    }
    const dailyRevenue = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(startOfToday);
      d.setDate(d.getDate() - (13 - i));
      const key = d.toISOString().slice(0, 10);
      return { date: key, revenue: dailyMap.get(key) ?? 0 };
    });
    const maxDaily = Math.max(1, ...dailyRevenue.map((d) => d.revenue));

    const topItemsRaw = await db.order_items.groupBy({
      by: ["item_name"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });

    return {
      todayRevenue: Number(todayRevenue._sum.total ?? 0),
      sevenDayRevenue: Number(sevenDayRevenue._sum.total ?? 0),
      thirtyDayRevenue: Number(thirtyDayRevenue._sum.total ?? 0),
      dailyRevenue,
      maxDaily,
      topItems: topItemsRaw.map((i) => ({ name: i.item_name, quantity: i._sum.quantity ?? 0 })),
      statusCounts: statusCounts.map((s) => ({ status: s.status, count: s._count.status })),
    };
  } catch {
    return {
      todayRevenue: 0,
      sevenDayRevenue: 0,
      thirtyDayRevenue: 0,
      dailyRevenue: [],
      maxDaily: 1,
      topItems: [],
      statusCounts: [],
    };
  }
}

export default async function AdminReportsPage() {
  const data = await getReportData();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold text-white font-[family-name:var(--font-fraunces)] mb-6">
        Reports
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {[
          { label: "Today's Revenue", value: data.todayRevenue },
          { label: "Last 7 Days", value: data.sevenDayRevenue },
          { label: "Last 30 Days", value: data.thirtyDayRevenue },
        ].map(({ label, value }) => (
          <div key={label} className="bg-stone-900 rounded-xl border border-stone-800 p-5">
            <p className="text-xs uppercase tracking-wide text-stone-500 mb-1">{label}</p>
            <p className="text-2xl font-semibold text-white font-[family-name:var(--font-plex-mono)]">
              {formatPrice(value)}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-stone-900 rounded-xl border border-stone-800 p-6">
          <h2 className="font-[family-name:var(--font-fraunces)] font-semibold text-white mb-4">
            Revenue — Last 14 Days
          </h2>
          <div className="flex items-end gap-2 h-40">
            {data.dailyRevenue.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div
                  className="w-full bg-admin-amber rounded-t hover:bg-admin-amber/80 transition-colors"
                  style={{ height: `${Math.max(4, (d.revenue / data.maxDaily) * 100)}%` }}
                  title={`${d.date}: ${formatPrice(d.revenue)}`}
                />
                <span className="text-[9px] text-stone-500 font-[family-name:var(--font-plex-mono)] rotate-45 origin-left whitespace-nowrap">
                  {d.date.slice(5)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-stone-900 rounded-xl border border-stone-800 p-6">
          <h2 className="font-[family-name:var(--font-fraunces)] font-semibold text-white mb-4">
            Top Sellers
          </h2>
          {data.topItems.length === 0 ? (
            <p className="text-stone-500 text-sm">No sales yet.</p>
          ) : (
            <div className="space-y-3">
              {data.topItems.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <span className="text-stone-300">
                    <span className="text-stone-600 font-[family-name:var(--font-plex-mono)] mr-2">
                      {idx + 1}
                    </span>
                    {item.name}
                  </span>
                  <span className="text-white font-[family-name:var(--font-plex-mono)]">
                    {item.quantity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-stone-900 rounded-xl border border-stone-800 p-6 mt-6">
        <h2 className="font-[family-name:var(--font-fraunces)] font-semibold text-white mb-4">
          Orders by Status
        </h2>
        <div className="flex gap-4 flex-wrap">
          {data.statusCounts.map((s) => (
            <div key={s.status} className="flex items-center gap-2">
              <span className="text-2xl font-semibold text-white font-[family-name:var(--font-plex-mono)]">
                {s.count}
              </span>
              <span className="text-xs text-stone-500 capitalize">{s.status.replace(/_/g, " ")}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
