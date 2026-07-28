import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  imageUrl: z.string().optional(),
  isAvailable: z.boolean().optional(),
  isVegetarian: z.boolean().optional(),
  isVegan: z.boolean().optional(),
  isGlutenFree: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const updateData: any = {
      updated_at: new Date(),
    };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.categoryId !== undefined) updateData.category_id = data.categoryId;
    if (data.imageUrl !== undefined) updateData.image_url = data.imageUrl;
    if (data.isAvailable !== undefined) updateData.is_available = data.isAvailable;
    if (data.isVegetarian !== undefined) updateData.is_vegetarian = data.isVegetarian;
    if (data.isVegan !== undefined) updateData.is_vegan = data.isVegan;
    if (data.isGlutenFree !== undefined) updateData.is_gluten_free = data.isGlutenFree;
    if (data.isFeatured !== undefined) updateData.is_featured = data.isFeatured;

    const updated = await db.menu_items.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    if (err && typeof err === "object" && (err as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await db.menu_items.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err && typeof err === "object" && (err as { code?: string }).code === "P2025") {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
