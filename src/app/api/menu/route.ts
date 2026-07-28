import { NextResponse } from "next/server";
import { db } from "@/db";

export async function GET() {
  try {
    const [categories, items] = await Promise.all([
      db.menu_categories.findMany({
        where: { is_active: true },
        orderBy: { sort_order: "asc" },
      }),
      db.menu_items.findMany({
        where: { is_available: true },
        include: { category: true },
        orderBy: [{ category: { sort_order: "asc" } }, { sort_order: "asc" }],
      }),
    ]);
    return NextResponse.json({ categories, items });
  } catch {
    return NextResponse.json({ error: "Failed to fetch menu" }, { status: 500 });
  }
}
