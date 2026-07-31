import { db } from "@/db";
import { formatPrice } from "@/lib/utils";

export type PromoValidation =
  | { ok: true; promoId: string; code: string; discountAmount: number }
  | { ok: false; error: string };

export async function validatePromo(rawCode: string, subtotal: number): Promise<PromoValidation> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, error: "Enter a promo code" };

  const promo = await db.promos.findUnique({ where: { code } });
  if (!promo) return { ok: false, error: "Invalid promo code" };
  if (!promo.is_active) return { ok: false, error: "This promo code is no longer active" };
  if (promo.expires_at && promo.expires_at < new Date()) {
    return { ok: false, error: "This promo code has expired" };
  }
  if (promo.max_redemptions !== null && promo.times_redeemed >= promo.max_redemptions) {
    return { ok: false, error: "This promo code has reached its redemption limit" };
  }

  const minOrder = Number(promo.min_order);
  if (subtotal < minOrder) {
    return { ok: false, error: `Minimum order of ${formatPrice(minOrder)} required for this code` };
  }

  const rawDiscount =
    promo.discount_type === "percent"
      ? (subtotal * Number(promo.discount_value)) / 100
      : Number(promo.discount_value);
  const discountAmount = Math.round(Math.min(rawDiscount, subtotal) * 100) / 100;

  return { ok: true, promoId: promo.id, code: promo.code, discountAmount };
}
