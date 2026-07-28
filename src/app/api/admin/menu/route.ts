import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.string().min(1),
  categoryId: z.string().uuid(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  isVegetarian: z.boolean().default(false),
  isVegan: z.boolean().default(false),
  isGlutenFree: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
});

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const slug = `${toSlug(data.name)}-${Date.now()}`;
    const item = await db.menu_items.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        category_id: data.categoryId,
        image_url: data.imageUrl || null,
        is_available: true,
        is_vegetarian: data.isVegetarian,
        is_vegan: data.isVegan,
        is_gluten_free: data.isGlutenFree,
        is_featured: data.isFeatured,
        slug,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}
