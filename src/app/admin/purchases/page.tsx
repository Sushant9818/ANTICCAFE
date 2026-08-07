import { db } from "@/db";
import { PurchaseListManager } from "@/components/admin/purchase-list-manager";

export const dynamic = "force-dynamic";

async function getPurchaseItems() {
  try {
    const rows = await db.purchase_items.findMany({ orderBy: { created_at: "desc" } });
    return rows.map((p) => ({
      id: p.id,
      itemName: p.item_name,
      quantity: p.quantity,
      price: p.price ? p.price.toString() : null,
      note: p.note,
      status: p.status,
      addedBy: p.added_by,
      createdAt: p.created_at.toISOString(),
      boughtAt: p.bought_at ? p.bought_at.toISOString() : null,
    }));
  } catch {
    return [];
  }
}

export default async function AdminPurchasesPage() {
  const items = await getPurchaseItems();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Purchases</h1>
      <PurchaseListManager initialItems={items} />
    </div>
  );
}
