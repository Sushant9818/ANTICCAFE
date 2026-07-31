import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { z } from "zod";

const schema = z.object({
  code: z.string().min(1),
  description: z.string().optional(),
  discountType: z.enum(["percent", "flat"]).default("percent"),
  discountValue: z.string().min(1),
  minOrder: z.string().optional(),
  maxRedemptions: z.number().int().positive().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const promo = await db.promos.create({
      data: {
        code: data.code.trim().toUpperCase(),
        description: data.description || null,
        discount_type: data.discountType,
        discount_value: data.discountValue,
        min_order: data.minOrder || "0",
        max_redemptions: data.maxRedemptions ?? null,
        expires_at: data.expiresAt ? new Date(data.expiresAt) : null,
        is_active: true,
      },
    });
    return NextResponse.json(promo, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    if (err && typeof err === "object" && (err as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "Promo code already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create promo" }, { status: 500 });
  }
}
