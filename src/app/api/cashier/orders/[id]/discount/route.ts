import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { z } from "zod";
import { TAX_RATE } from "@/lib/constants";
import { validatePromo } from "@/lib/promo";

const schema = z.object({
  promoCode: z.string().min(1),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const order = await db.orders.findUnique({ where: { id }, include: { items: true } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.payment_status === "paid") {
      return NextResponse.json({ error: "Can't discount an order that's already paid" }, { status: 400 });
    }

    const subtotal = order.items.reduce((s, i) => s + Number(i.item_price) * i.quantity, 0);
    const result = await validatePromo(data.promoCode, subtotal);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const discountedSubtotal = subtotal - result.discountAmount;
    const tax = discountedSubtotal * TAX_RATE;
    const deliveryFee = Number(order.delivery_fee);
    const tip = Number(order.tip);
    const total = discountedSubtotal + tax + deliveryFee + tip;

    const updated = await db.orders.update({
      where: { id },
      data: {
        discount: result.discountAmount.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        promo_code: result.code,
        updated_at: new Date(),
      },
    });

    await db.promos.update({
      where: { id: result.promoId },
      data: { times_redeemed: { increment: 1 } },
    });

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to apply discount" }, { status: 500 });
  }
}
