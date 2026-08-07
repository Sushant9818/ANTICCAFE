import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { z } from "zod";
import { getCurrentActor, logAction } from "@/lib/audit";

const schema = z.object({
  itemName: z.string().min(1),
  quantity: z.string().trim().optional(),
  price: z.union([z.string(), z.number()]).optional(),
  note: z.string().trim().optional(),
});

export async function GET() {
  const items = await db.purchase_items.findMany({
    orderBy: { created_at: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const actor = await getCurrentActor();
    const price = data.price !== undefined && data.price !== "" ? Number(data.price) : null;

    const item = await db.purchase_items.create({
      data: {
        item_name: data.itemName,
        quantity: data.quantity || null,
        price,
        note: data.note || null,
        added_by: actor?.email ?? null,
      },
    });

    await logAction({
      action: "purchase.added",
      targetType: "purchase_item",
      targetId: item.id,
      metadata: { itemName: item.item_name, quantity: item.quantity, price: item.price?.toString() },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}
