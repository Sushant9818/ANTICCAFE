import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { z } from "zod";

const schema = z.object({
  paymentMethod: z.enum(["cash", "card", "esewa", "khalti"]),
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
    if (order.payment_status === "paid") {
      return NextResponse.json({ error: "This order is already paid" }, { status: 400 });
    }

    const updated = await db.orders.update({
      where: { id },
      data: {
        payment_status: "paid",
        payment_method: data.paymentMethod,
        updated_at: new Date(),
      },
    });
    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to process payment" }, { status: 500 });
  }
}
