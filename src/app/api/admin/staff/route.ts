import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { z } from "zod";
import { logAction } from "@/lib/audit";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["admin", "waiter", "kitchen", "cashier"]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const staff = await db.staff.create({
      data: { name: data.name, email: data.email.toLowerCase(), role: data.role },
    });

    await logAction({
      action: "staff.created",
      targetType: "staff",
      targetId: staff.id,
      metadata: { email: staff.email, role: staff.role },
    });

    return NextResponse.json(staff, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    if (err && typeof err === "object" && (err as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "That email is already on the staff list" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to add staff member" }, { status: 500 });
  }
}
