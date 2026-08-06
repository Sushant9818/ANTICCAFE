import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { z } from "zod";
import { logAction } from "@/lib/audit";

const schema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(["admin", "waiter", "kitchen", "cashier"]).optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const before = await db.staff.findUnique({ where: { id } });
    if (!before) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    const updated = await db.staff.update({
      where: { id },
      data: {
        name: data.name,
        role: data.role,
        is_active: data.isActive,
        updated_at: new Date(),
      },
    });

    if (data.role !== undefined && data.role !== before.role) {
      await logAction({
        action: "staff.role_changed",
        targetType: "staff",
        targetId: id,
        metadata: { email: updated.email, from: before.role, to: data.role },
      });
    }
    if (data.isActive !== undefined && data.isActive !== before.is_active) {
      await logAction({
        action: data.isActive ? "staff.activated" : "staff.deactivated",
        targetType: "staff",
        targetId: id,
        metadata: { email: updated.email },
      });
    }

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update staff member" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const staff = await db.staff.delete({ where: { id } });
    await logAction({
      action: "staff.removed",
      targetType: "staff",
      targetId: id,
      metadata: { email: staff.email, role: staff.role },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err && typeof err === "object" && (err as { code?: string }).code === "P2025") {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Failed to remove staff member" }, { status: 500 });
  }
}
