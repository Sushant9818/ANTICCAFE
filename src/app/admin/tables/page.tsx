import { getTablesWithOpenTabs } from "@/lib/dine-in";
import { TablesGrid } from "@/components/admin/tables-grid";

export const dynamic = "force-dynamic";

export default async function AdminTablesPage() {
  const tables = await getTablesWithOpenTabs();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold text-white font-[family-name:var(--font-fraunces)] mb-6">
        Tables
      </h1>
      <TablesGrid initialTables={tables} />
    </div>
  );
}
