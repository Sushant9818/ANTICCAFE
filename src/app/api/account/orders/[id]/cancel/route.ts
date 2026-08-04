import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { getCurrentCustomer } from "@/lib/customer";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const order = await db.orders.findUnique({ where: { id } });
  if (!order || order.customer_id !== customer.id) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.status !== "pending") {
    return NextResponse.json({ error: "Only pending orders can be cancelled" }, { status: 400 });
  }

  await db.orders.update({ where: { id }, data: { status: "cancelled" } });
  return NextResponse.json({ ok: true });
}
