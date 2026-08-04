import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { getCurrentCustomer } from "@/lib/customer";

const schema = z.object({
  orderId: z.string().uuid(),
  menuItemId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const order = await db.orders.findUnique({
      where: { id: data.orderId },
      include: { items: true },
    });

    if (!order || order.customer_id !== customer.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.status !== "delivered") {
      return NextResponse.json(
        { error: "You can only review items from a delivered order" },
        { status: 400 }
      );
    }
    if (!order.items.some((i) => i.menu_item_id === data.menuItemId)) {
      return NextResponse.json({ error: "Item not found on this order" }, { status: 400 });
    }

    const review = await db.reviews.upsert({
      where: { customer_id_menu_item_id: { customer_id: customer.id, menu_item_id: data.menuItemId } },
      create: {
        customer_id: customer.id,
        menu_item_id: data.menuItemId,
        order_id: data.orderId,
        rating: data.rating,
        comment: data.comment || null,
      },
      update: {
        rating: data.rating,
        comment: data.comment || null,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
