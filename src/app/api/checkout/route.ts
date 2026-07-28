import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { stripe } from "@/lib/stripe";
import { db } from "@/db";
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
  customerName: z.string().min(1),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerPhone: z.string().min(1),
  deliveryAddress: z.string().optional(),
  deliveryCity: z.string().optional(),
  deliveryState: z.string().optional(),
  deliveryZip: z.string().optional(),
  specialInstructions: z.string().optional(),
  promoCode: z.string().optional(),
  tip: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const subtotal = data.items.reduce((s, i) => s + i.price * i.quantity, 0);
    const tax = subtotal * TAX_RATE;
    const delivery = data.orderType === "delivery" && subtotal < FREE_DELIVERY_THRESHOLD ? DELIVERY_FEE : 0;
    const tip = parseFloat(data.tip ?? "0") || 0;
    const total = subtotal + tax + delivery + tip;

    const accessToken = randomBytes(20).toString("hex");

    // Create order in DB first
    const order = await db.orders.create({
      data: {
        customer_name: data.customerName,
        customer_email: data.customerEmail || null,
        customer_phone: data.customerPhone,
        order_type: data.orderType,
        status: "pending",
        payment_status: "pending",
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        tip: tip.toFixed(2),
        delivery_fee: delivery.toFixed(2),
        total: total.toFixed(2),
        delivery_address: data.deliveryAddress || null,
        delivery_city: data.deliveryCity || null,
        delivery_state: data.deliveryState || null,
        delivery_zip: data.deliveryZip || null,
        special_instructions: data.specialInstructions || null,
        promo_code: data.promoCode || null,
        access_token: accessToken,
      },
    });

    // Insert order items
    await db.order_items.createMany({
      data: data.items.map((item) => ({
        order_id: order.id,
        menu_item_id: item.id,
        item_name: item.name,
        item_price: item.price.toFixed(2),
        quantity: item.quantity,
      })),
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        ...data.items.map((item) => ({
          price_data: {
            currency: "usd",
            product_data: { name: item.name },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        })),
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Tax" },
            unit_amount: Math.round(tax * 100),
          },
          quantity: 1,
        },
        ...(delivery > 0
          ? [
              {
                price_data: {
                  currency: "usd",
                  product_data: { name: "Delivery fee" },
                  unit_amount: Math.round(delivery * 100),
                },
                quantity: 1,
              },
            ]
          : []),
        ...(tip > 0
          ? [
              {
                price_data: {
                  currency: "usd",
                  product_data: { name: `Tip (thank you!)` },
                  unit_amount: Math.round(tip * 100),
                },
                quantity: 1,
              },
            ]
          : []),
      ],
      customer_email: data.customerEmail || undefined,
      metadata: {
        orderId: order.id,
        orderNumber: String(order.order_number),
      },
      success_url: `${baseUrl}/order/${order.id}?success=1`,
      cancel_url: `${baseUrl}/checkout?cancelled=1`,
    });

    // Store Stripe session ID
    await db.orders.update({
      where: { id: order.id },
      data: { stripe_checkout_session_id: session.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
