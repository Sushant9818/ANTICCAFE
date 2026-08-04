import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; orderId: string }> }
) {
  const { id: tabId, orderId } = await params;

  const [order, tab] = await Promise.all([
    db.orders.findUnique({ where: { id: orderId } }),
    db.dine_in_tabs.findUnique({ where: { id: tabId } }),
  ]);
  if (!order || order.tab_id !== tabId || !tab) {
    return NextResponse.json({ error: "Round not found" }, { status: 404 });
  }
  if (tab.status !== "open") {
    return NextResponse.json({ error: "This tab is already closed" }, { status: 400 });
  }
  if (!["pending", "confirmed"].includes(order.status)) {
    return NextResponse.json(
      { error: "This round has already started preparing and can't be cancelled" },
      { status: 400 }
    );
  }

  await db.orders.update({ where: { id: orderId }, data: { status: "cancelled" } });
  return NextResponse.json({ ok: true });
}
