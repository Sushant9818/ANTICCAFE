import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { z } from "zod";
import { TAX_RATE, DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from "@/lib/constants";
import { randomBytes } from "crypto";

const schema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      price: z.number(),
      quantity: z.number().int().positive(),
    })
  ).min(1),
  orderType: z.enum(["pickup", "delivery"]),
  paymentMethod: z.enum(["cash", "card", "esewa", "khalti"]),
  customerName: z.string().min(1),
  customerPhone: z.string().optional(),
  customerEmail: z.string().email().optional().or(z.literal("")),
  deliveryAddress: z.string().optional(),
  deliveryCity: z.string().optional(),
  deliveryState: z.string().optional(),
  deliveryZip: z.string().optional(),
  specialInstructions: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const subtotal = data.items.reduce((s, i) => s + i.price * i.quantity, 0);
    const tax = subtotal * TAX_RATE;
    const delivery =
      data.orderType === "delivery" && subtotal < FREE_DELIVERY_THRESHOLD ? DELIVERY_FEE : 0;
    const total = subtotal + tax + delivery;

    const order = await db.orders.create({
      data: {
        customer_name: data.customerName,
        customer_phone: data.customerPhone || null,
        customer_email: data.customerEmail || null,
        order_type: data.orderType,
        status: "pending",
        payment_status: "paid",
        payment_method: data.paymentMethod,
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        delivery_fee: delivery.toFixed(2),
        total: total.toFixed(2),
        delivery_address: data.deliveryAddress || null,
        delivery_city: data.deliveryCity || null,
        delivery_state: data.deliveryState || null,
        delivery_zip: data.deliveryZip || null,
        special_instructions: data.specialInstructions || null,
        access_token: randomBytes(20).toString("hex"),
      },
    });

    await db.order_items.createMany({
      data: data.items.map((item) => ({
        order_id: order.id,
        menu_item_id: item.id,
        item_name: item.name,
        item_price: item.price.toFixed(2),
        quantity: item.quantity,
      })),
    });

    return NextResponse.json({ orderId: order.id }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
