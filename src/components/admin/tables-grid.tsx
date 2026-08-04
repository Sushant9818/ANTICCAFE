"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type Table = {
  id: string;
  number: number;
  openTab: {
    id: string;
    serverName: string | null;
    openedAt: Date;
    roundCount: number;
    total: number;
  } | null;
};

type Props = {
  initialTables: Table[];
};

export function TablesGrid({ initialTables }: Props) {
  const router = useRouter();
  const [tables, setTables] = useState(initialTables);
  const [opening, setOpening] = useState<string | null>(null);
  const [addingTable, setAddingTable] = useState(false);
  const [newNumber, setNewNumber] = useState("");
  const [pendingTable, setPendingTable] = useState<Table | null>(null);
  const [serverName, setServerName] = useState("");

  const openTable = (table: Table) => {
    if (table.openTab) {
      router.push(`/admin/tables/${table.openTab.id}`);
      return;
    }
    setPendingTable(table);
    setServerName("");
  };

  const startTab = async () => {
    if (!pendingTable) return;
    if (!serverName.trim()) {
      toast.error("Enter the server's name");
      return;
    }
    setOpening(pendingTable.id);
    try {
      const res = await fetch("/api/admin/tabs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableId: pendingTable.id, serverName: serverName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/admin/tables/${data.tab.id}`);
    } catch {
      toast.error("Failed to open table");
      setOpening(null);
    }
  };

  const addTable = async () => {
    const number = parseInt(newNumber, 10);
    if (!number || number <= 0) {
      toast.error("Enter a valid table number");
      return;
    }
    try {
      const res = await fetch("/api/admin/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTables((prev) =>
        [...prev, { id: data.id, number: data.number, openTab: null }].sort(
          (a, b) => a.number - b.number
        )
      );
      setNewNumber("");
      setAddingTable(false);
      toast.success(`Table ${number} added`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add table");
    }
  };

  const removeTable = async (table: Table) => {
    if (!confirm(`Remove Table ${table.number}?`)) return;
    try {
      const res = await fetch(`/api/admin/tables/${table.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTables((prev) => prev.filter((t) => t.id !== table.id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove table");
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-6">
        {addingTable ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              value={newNumber}
              onChange={(e) => setNewNumber(e.target.value)}
              placeholder="Table #"
              className="w-24 rounded-lg border border-stone-700 px-3 py-2 text-sm focus:outline-none focus:border-admin-amber"
              autoFocus
            />
            <button
              onClick={addTable}
              className="px-4 py-2 rounded-full bg-admin-amber text-white text-sm font-medium hover:bg-admin-amber/90"
            >
              Add
            </button>
            <button
              onClick={() => setAddingTable(false)}
              className="px-4 py-2 rounded-full border border-stone-700 text-stone-300 text-sm"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAddingTable(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-admin-amber text-white text-sm font-medium hover:bg-admin-amber/90"
          >
            <Plus className="h-4 w-4" /> Add Table
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {tables.map((table) => (
          <div key={table.id} className="relative group">
            <button
              onClick={() => openTable(table)}
              disabled={opening === table.id}
              className={`relative w-full aspect-square rounded-xl border flex flex-col items-center justify-center gap-1 overflow-hidden transition-colors ${
                table.openTab
                  ? "bg-admin-amber border-admin-amber text-white hover:bg-admin-amber/90"
                  : "bg-stone-900 border-stone-800 text-white hover:border-admin-amber"
              }`}
            >
              {table.openTab && (
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-white/20" />
              )}
              <span className="text-2xl font-semibold font-[family-name:var(--font-fraunces)]">
                {table.number}
              </span>
              {table.openTab ? (
                <>
                  <span className="text-xs opacity-90">
                    {table.openTab.roundCount} round{table.openTab.roundCount === 1 ? "" : "s"}
                  </span>
                  <span className="text-xs font-semibold font-[family-name:var(--font-plex-mono)]">
                    {formatPrice(table.openTab.total)}
                  </span>
                </>
              ) : (
                <span className="text-xs text-admin-taupe">Empty</span>
              )}
            </button>
            {!table.openTab && (
              <button
                onClick={() => removeTable(table)}
                className="absolute -top-2 -right-2 p-1 rounded-full bg-stone-900 border border-stone-700 text-admin-taupe opacity-0 group-hover:opacity-100 hover:text-red-600 transition-opacity"
                aria-label={`Remove table ${table.number}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
        {tables.length === 0 && (
          <p className="col-span-full text-center py-10 text-admin-taupe">
            No tables yet — add one to get started.
          </p>
        )}
      </div>

      {pendingTable && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-stone-900 rounded-xl p-6 w-full max-w-sm">
            <h2 className="font-[family-name:var(--font-fraunces)] font-semibold text-white mb-1">
              Open Table {pendingTable.number}
            </h2>
            <p className="text-sm text-admin-taupe mb-4">Who's serving this table?</p>
            <input
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
              placeholder="Server name"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && startTab()}
              className="w-full rounded-lg border border-stone-700 px-3 py-2 text-sm mb-4 focus:outline-none focus:border-admin-amber"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPendingTable(null)}
                className="px-4 py-2 rounded-full border border-stone-700 text-stone-300 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={startTab}
                disabled={opening === pendingTable.id}
                className="px-4 py-2 rounded-full bg-admin-amber text-white text-sm font-medium hover:bg-admin-amber/90 disabled:opacity-50"
              >
                {opening === pendingTable.id ? "Opening…" : "Start Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
