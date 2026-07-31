import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { z } from "zod";
import { sendReservationConfirmation } from "@/lib/notify-reservation";

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

    let justConfirmed = false;
    if (data.status === "confirmed") {
      // Atomic guard: only counts as "just confirmed" if this request is the
      // one that actually flipped status away from "confirmed", preventing
      // a duplicate notification from a race between concurrent requests.
      const { count } = await db.reservations.updateMany({
        where: { id, status: { not: "confirmed" } },
        data: updateData,
      });
      justConfirmed = count > 0;
      if (!justConfirmed) {
        await db.reservations.update({ where: { id }, data: updateData });
      }
    } else {
      await db.reservations.update({ where: { id }, data: updateData });
    }

    const updated = await db.reservations.findUniqueOrThrow({ where: { id } });

    if (justConfirmed) {
      await sendReservationConfirmation({
        customerName: updated.customer_name,
        customerEmail: updated.customer_email,
        customerPhone: updated.customer_phone,
        date: updated.date,
        timeSlot: updated.time_slot,
        partySize: updated.party_size,
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
    return NextResponse.json({ error: "Failed to update reservation" }, { status: 500 });
  }
}
