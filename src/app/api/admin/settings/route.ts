import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { updateRestaurantSettings } from "@/lib/settings";

const schema = z.object({
  acceptingOrders: z.boolean().optional(),
  hoursNote: z.string().max(200).optional(),
  deliveryNote: z.string().max(200).optional(),
});

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const updated = await updateRestaurantSettings(data);
    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
