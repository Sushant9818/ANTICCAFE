import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { z } from "zod";

const schema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
  adminNotes: z.string().optional(),
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
    if (data.adminNotes !== undefined) updateData.admin_notes = data.adminNotes;

    const updated = await db.reservations.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    if (err && typeof err === "object" && (err as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update reservation" }, { status: 500 });
  }
}
