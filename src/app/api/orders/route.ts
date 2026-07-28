import { NextResponse } from "next/server";
import { db } from "@/db";

export async function GET() {
  try {
    const result = await db.orders.findMany({
      orderBy: { created_at: "desc" },
      take: 50,
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
