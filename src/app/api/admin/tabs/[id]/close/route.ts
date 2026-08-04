import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { z } from "zod";

const schema = z.object({
  paymentMethod: z.enum(["cash", "card", "esewa", "khalti"]),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: tabId } = await params;
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const tab = await db.dine_in_tabs.findUnique({ where: { id: tabId } });
    if (!tab) {
      return NextResponse.json({ error: "Tab not found" }, { status: 404 });
    }
    if (tab.status !== "open") {
      return NextResponse.json({ error: "This tab is already closed" }, { status: 400 });
    }

    await db.orders.updateMany({
      where: { tab_id: tabId, status: { not: "cancelled" } },
      data: { payment_status: "paid", payment_method: data.paymentMethod },
    });

    const closed = await db.dine_in_tabs.update({
      where: { id: tabId },
      data: {
        status: "closed",
        payment_status: "paid",
        payment_method: data.paymentMethod,
        closed_at: new Date(),
      },
    });

    return NextResponse.json(closed);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to close tab" }, { status: 500 });
  }
}
