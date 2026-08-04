import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { z } from "zod";

const schema = z.object({
  reason: z.string().max(500).optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const order = await db.orders.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.payment_status !== "paid") {
      return NextResponse.json({ error: "Only paid orders can be refunded" }, { status: 400 });
    }
    if (order.refund_requested) {
      return NextResponse.json({ error: "Refund already requested for this order" }, { status: 400 });
    }

    const updated = await db.orders.update({
      where: { id },
      data: {
        refund_requested: true,
        refund_requested_at: new Date(),
        refund_reason: data.reason || null,
      },
    });
    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to request refund" }, { status: 500 });
  }
}
