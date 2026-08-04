import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { z } from "zod";
import { TAX_RATE } from "@/lib/constants";

const schema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      price: z.number(),
      quantity: z.number().int().positive(),
    })
  ).min(1),
  specialInstructions: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: tabId } = await params;
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const tab = await db.dine_in_tabs.findUnique({
      where: { id: tabId },
      include: { table: true },
    });
    if (!tab) {
      return NextResponse.json({ error: "Tab not found" }, { status: 404 });
    }
    if (tab.status !== "open") {
      return NextResponse.json({ error: "This tab is already closed" }, { status: 400 });
    }

    const subtotal = data.items.reduce((s, i) => s + i.price * i.quantity, 0);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    const order = await db.orders.create({
      data: {
        customer_name: tab.server_name ? `Table ${tab.table.number} (${tab.server_name})` : `Table ${tab.table.number}`,
        order_type: "dine_in",
        status: "pending",
        payment_status: "pending",
        payment_method: "dine_in",
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        special_instructions: data.specialInstructions || null,
        tab_id: tab.id,
      },
    });

    await db.order_items.createMany({
      data: data.items.map((item) => ({
        order_id: order.id,
        menu_item_id: item.id,
        item_name: item.name,
        item_price: item.price.toFixed(2),
        quantity: item.quantity,
      })),
    });

    return NextResponse.json({ orderId: order.id }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to send round to kitchen" }, { status: 500 });
  }
}
