import { db } from "@/db";
import { PromoBarClient } from "@/components/layout/promo-bar-client";

function formatDiscount(type: string, value: string) {
  const n = Number(value);
  return type === "percent" ? `${n}% off` : `Rs ${n} off`;
}

export async function PromoBar() {
  const promo = await db.promos.findFirst({
    where: {
      is_active: true,
      OR: [{ expires_at: null }, { expires_at: { gt: new Date() } }],
    },
    orderBy: { created_at: "desc" },
  });

  if (!promo) return null;
  if (promo.max_redemptions !== null && promo.times_redeemed >= promo.max_redemptions) {
    return null;
  }

  const discount = formatDiscount(promo.discount_type, promo.discount_value.toString());
  const message = promo.description
    ? `${promo.description} — use code ${promo.code}`
    : `${discount} — use code ${promo.code}`;

  return <PromoBarClient id={promo.id} message={message} />;
}
