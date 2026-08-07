import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { logAction } from "@/lib/audit";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: tabId } = await params;
  try {
    const tab = await db.dine_in_tabs.findUnique({ where: { id: tabId } });
    if (!tab) {
      return NextResponse.json({ error: "Tab not found" }, { status: 404 });
    }
    if (tab.status !== "open") {
      return NextResponse.json({ error: "This tab is already closed" }, { status: 400 });
    }

    await db.orders.updateMany({
      where: { tab_id: tabId, status: { not: "cancelled" } },
      data: { status: "cancelled" },
    });

    const cancelled = await db.dine_in_tabs.update({
      where: { id: tabId },
      data: { status: "cancelled", closed_at: new Date() },
    });

    await logAction({
      action: "tab.cancelled",
      targetType: "dine_in_tab",
      targetId: tabId,
      metadata: { tableId: tab.table_id },
    });

    return NextResponse.json(cancelled);
  } catch {
    return NextResponse.json({ error: "Failed to cancel table" }, { status: 500 });
  }
}
