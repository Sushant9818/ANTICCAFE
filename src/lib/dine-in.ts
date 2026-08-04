import { db } from "@/db";

export async function getTablesWithOpenTabs() {
  const tables = await db.tables.findMany({
    where: { is_active: true },
    orderBy: { number: "asc" },
    include: {
      tabs: {
        where: { status: "open" },
        include: { orders: { include: { items: true } } },
      },
    },
  });

  return tables.map((table) => {
    const tab = table.tabs[0] ?? null;
    const total = tab
      ? tab.orders.reduce((sum, o) => sum + Number(o.total), 0)
      : 0;
    return {
      id: table.id,
      number: table.number,
      openTab: tab
        ? {
            id: tab.id,
            serverName: tab.server_name,
            openedAt: tab.opened_at,
            roundCount: tab.orders.length,
            total,
          }
        : null,
    };
  });
}
