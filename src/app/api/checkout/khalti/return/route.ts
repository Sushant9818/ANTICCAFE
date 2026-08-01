import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { lookupKhaltiPayment } from "@/lib/khalti";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export async function GET(req: NextRequest) {
  const pidx = req.nextUrl.searchParams.get("pidx");
  if (!pidx) {
    return NextResponse.redirect(`${baseUrl}/checkout?cancelled=1`);
  }

  try {
    const order = await db.orders.findFirst({ where: { khalti_pidx: pidx } });
    if (!order) {
      return NextResponse.redirect(`${baseUrl}/checkout?cancelled=1`);
    }

    const result = await lookupKhaltiPayment(pidx);

    if (result.status !== "Completed") {
      return NextResponse.redirect(`${baseUrl}/checkout?cancelled=1`);
    }

    await db.orders.update({
      where: { id: order.id },
      data: { payment_status: "paid", status: "confirmed" },
    });

    return NextResponse.redirect(`${baseUrl}/order/${order.id}?success=1`);
  } catch (err) {
    console.error("Khalti return handler error:", err);
    return NextResponse.redirect(`${baseUrl}/checkout?cancelled=1`);
  }
}
