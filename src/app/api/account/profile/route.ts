import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { getCurrentCustomer } from "@/lib/customer";

const schema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
});

export async function PUT(req: NextRequest) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const updated = await db.customers.update({
      where: { id: customer.id },
      data: {
        name: data.name,
        phone: data.phone,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
