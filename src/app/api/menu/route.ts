import { NextResponse } from "next/server";
import { db } from "@/db";
import { menuItems, menuCategories } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  try {
    const [categories, items] = await Promise.all([
      db.select().from(menuCategories).where(eq(menuCategories.isActive, true)).orderBy(asc(menuCategories.sortOrder)),
      db
        .select()
        .from(menuItems)
        .innerJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
        .where(eq(menuItems.isAvailable, true))
        .orderBy(asc(menuCategories.sortOrder), asc(menuItems.sortOrder)),
    ]);
    return NextResponse.json({ categories, items });
  } catch {
    return NextResponse.json({ error: "Failed to fetch menu" }, { status: 500 });
  }
}
