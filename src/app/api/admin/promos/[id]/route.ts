import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { z } from "zod";

const schema = z.object({
  code: z.string().min(1).optional(),
  description: z.string().optional(),
  discountType: z.enum(["percent", "flat"]).optional(),
  discountValue: z.string().optional(),
  minOrder: z.string().optional(),
  maxRedemptions: z.number().int().positive().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const updateData: Record<string, unknown> = { updated_at: new Date() };
    if (data.code !== undefined) updateData.code = data.code.trim().toUpperCase();
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.discountType !== undefined) updateData.discount_type = data.discountType;
    if (data.discountValue !== undefined) updateData.discount_value = data.discountValue;
    if (data.minOrder !== undefined) updateData.min_order = data.minOrder;
    if (data.maxRedemptions !== undefined) updateData.max_redemptions = data.maxRedemptions;
    if (data.expiresAt !== undefined) {
      updateData.expires_at = data.expiresAt ? new Date(data.expiresAt) : null;
    }
    if (data.isActive !== undefined) updateData.is_active = data.isActive;

    const updated = await db.promos.update({ where: { id }, data: updateData });
    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    if (err && typeof err === "object" && (err as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (err && typeof err === "object" && (err as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "Promo code already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to update promo" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await db.promos.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err && typeof err === "object" && (err as { code?: string }).code === "P2025") {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Failed to delete promo" }, { status: 500 });
  }
}
