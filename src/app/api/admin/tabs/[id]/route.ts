import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const tab = await db.dine_in_tabs.findUnique({
      where: { id },
      include: {
        table: true,
        orders: {
          include: { items: true },
          orderBy: { created_at: "asc" },
        },
      },
    });
    if (!tab) {
      return NextResponse.json({ error: "Tab not found" }, { status: 404 });
    }
    return NextResponse.json(tab);
  } catch {
    return NextResponse.json({ error: "Failed to load tab" }, { status: 500 });
  }
}
