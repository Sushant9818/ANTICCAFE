import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const openTab = await db.dine_in_tabs.findFirst({
      where: { table_id: id, status: "open" },
    });
    if (openTab) {
      return NextResponse.json(
        { error: "Cannot remove a table with an open tab" },
        { status: 409 }
      );
    }
    await db.tables.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err && typeof err === "object" && (err as { code?: string }).code === "P2025") {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Failed to remove table" }, { status: 500 });
  }
}
