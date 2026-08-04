import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { z } from "zod";

const schema = z.object({
  approve: z.boolean(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const order = await db.orders.findUnique({ where: { id } });
    if (!order || !order.refund_requested) {
      return NextResponse.json({ error: "No pending refund request for this order" }, { status: 404 });
    }

    const updated = await db.orders.update({
      where: { id },
      data: {
        refund_requested: false,
        payment_status: data.approve ? "refunded" : order.payment_status,
        updated_at: new Date(),
      },
    });
    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to process refund decision" }, { status: 500 });
  }
}
