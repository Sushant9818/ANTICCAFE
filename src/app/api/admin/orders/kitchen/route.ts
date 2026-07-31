import { NextResponse } from "next/server";
import { getKitchenOrders } from "@/lib/kitchen-orders";

export async function GET() {
  const orders = await getKitchenOrders();
  return NextResponse.json(orders);
}
