import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { z } from "zod";
import { logAction } from "@/lib/audit";

const schema = z.object({
  status: z.enum(["pending", "confirmed", "preparing", "ready", "out_for_delivery", "delivered", "cancelled"]).optional(),
  estimatedMinutes: z.number().int().positive().max(240).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const updateData: any = {
      updated_at: new Date(),
    };
    if (data.status !== undefined) updateData.status = data.status;
    if (data.estimatedMinutes !== undefined) {
      updateData.estimated_ready_at = new Date(Date.now() + data.estimatedMinutes * 60_000);
    }

    const updated = await db.orders.update({
      where: { id },
      data: updateData,
    });

    if (data.status === "cancelled") {
      await logAction({
        action: "order.cancelled",
        targetType: "order",
        targetId: id,
        metadata: { orderNumber: updated.order_number },
      });
    }

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    if (err && typeof err === "object" && (err as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
