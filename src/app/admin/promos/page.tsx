import { db } from "@/db";
import { AdminPromoManager } from "@/components/admin/promo-manager";

async function getPromos() {
  try {
    const rows = await db.promos.findMany({ orderBy: { created_at: "desc" } });
    return rows.map((p) => ({
      id: p.id,
      code: p.code,
      description: p.description,
      discountType: p.discount_type,
      discountValue: p.discount_value.toString(),
      minOrder: p.min_order.toString(),
      maxRedemptions: p.max_redemptions,
      timesRedeemed: p.times_redeemed,
      isActive: p.is_active,
      expiresAt: p.expires_at ? p.expires_at.toISOString() : null,
    }));
  } catch {
    return [];
  }
}

export default async function AdminPromosPage() {
  const promos = await getPromos();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-stone-900 mb-6">Promo Codes</h1>
      <AdminPromoManager initialPromos={promos} />
    </div>
  );
}
