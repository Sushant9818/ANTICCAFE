import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { z } from "zod";
import { logAction } from "@/lib/audit";

const schema = z.object({
  status: z.enum(["pending", "bought"]),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const item = await db.purchase_items.update({
      where: { id },
      data: {
        status: data.status,
        bought_at: data.status === "bought" ? new Date() : null,
      },
    });

    await logAction({
      action: data.status === "bought" ? "purchase.bought" : "purchase.reopened",
      targetType: "purchase_item",
      targetId: item.id,
      metadata: { itemName: item.item_name },
    });

    return NextResponse.json(item);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const item = await db.purchase_items.delete({ where: { id } });

    await logAction({
      action: "purchase.removed",
      targetType: "purchase_item",
      targetId: item.id,
      metadata: { itemName: item.item_name },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to remove item" }, { status: 500 });
  }
}
