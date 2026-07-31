import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validatePromo } from "@/lib/promo";

const schema = z.object({
  code: z.string().min(1),
  subtotal: z.number().nonnegative(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, subtotal } = schema.parse(body);
    const result = await validatePromo(code, subtotal);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({
      code: result.code,
      discountAmount: result.discountAmount,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to validate promo code" }, { status: 500 });
  }
}
