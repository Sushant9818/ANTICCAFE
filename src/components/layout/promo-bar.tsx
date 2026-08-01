import { db } from "@/db";
import { PromoBarClient } from "@/components/layout/promo-bar-client";

function formatDiscount(type: string, value: string) {
  const n = Number(value);
  return type === "percent" ? `${n}% off` : `Rs ${n} off`;
}

export async function PromoBar() {
  const promos = await db.promos.findMany({
    where: {
      is_active: true,
      OR: [{ expires_at: null }, { expires_at: { gt: new Date() } }],
    },
    orderBy: { created_at: "desc" },
  });

  const active = promos.filter(
    (p) => p.max_redemptions === null || p.times_redeemed < p.max_redemptions
  );

  if (active.length === 0) return null;

  const messages = active.map((promo) => {
    const discount = formatDiscount(promo.discount_type, promo.discount_value.toString());
    return promo.description
      ? `${promo.description} — use code ${promo.code}`
      : `${discount} — use code ${promo.code}`;
  });

  return <PromoBarClient messages={messages} />;
}
