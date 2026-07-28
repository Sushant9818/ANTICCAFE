import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { z } from "zod";

const schema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerPhone: z.string().optional(),
  date: z.string().min(1),
  timeSlot: z.string().min(1),
  partySize: z.string().transform(Number),
  specialRequests: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const reservation = await db.reservations.create({
      data: {
        customer_name: data.customerName,
        customer_email: data.customerEmail || null,
        customer_phone: data.customerPhone || null,
        date: data.date,
        time_slot: data.timeSlot,
        party_size: data.partySize,
        special_requests: data.specialRequests || null,
        status: "pending",
      },
    });
    return NextResponse.json(reservation, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create reservation" }, { status: 500 });
  }
}
