import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { decodeEsewaCallback, verifyEsewaCallbackSignature, verifyEsewaTransaction } from "@/lib/esewa";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export async function GET(req: NextRequest) {
  const data = req.nextUrl.searchParams.get("data");
  if (!data) {
    return NextResponse.redirect(`${baseUrl}/checkout?cancelled=1`);
  }

  try {
    const callback = decodeEsewaCallback(data);

    if (!verifyEsewaCallbackSignature(callback as unknown as Record<string, string>)) {
      console.error("eSewa callback signature mismatch", callback);
      return NextResponse.redirect(`${baseUrl}/checkout?cancelled=1`);
    }

    const order = await db.orders.findFirst({
      where: { esewa_transaction_uuid: callback.transaction_uuid },
    });
    if (!order) {
      return NextResponse.redirect(`${baseUrl}/checkout?cancelled=1`);
    }

    const status = await verifyEsewaTransaction(callback.transaction_uuid, Number(order.total));

    if (status.status !== "COMPLETE") {
      return NextResponse.redirect(`${baseUrl}/checkout?cancelled=1`);
    }

    await db.orders.update({
      where: { id: order.id },
      data: { payment_status: "paid", status: "confirmed" },
    });

    return NextResponse.redirect(`${baseUrl}/order/${order.id}?success=1`);
  } catch (err) {
    console.error("eSewa return handler error:", err);
    return NextResponse.redirect(`${baseUrl}/checkout?cancelled=1`);
  }
}
