# Kitchen Workflow (Approve → Prepare → Ready, with Estimated Time) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the Kitchen page drive an order from approval through "ready" (not just pending→approve), with the chef setting an estimated prep time that's shown to the customer.

**Architecture:** One new nullable `estimated_ready_at` column on `orders`, set by the existing `PATCH /api/admin/orders/[id]` endpoint when the chef approves with a chosen number of minutes. The Kitchen page fetches `pending`/`confirmed`/`preparing` orders instead of just `pending`, and the Kitchen board groups them into three sections with the appropriate action per section. The customer order-status page reads the same field to show an ETA line.

**Tech Stack:** Next.js App Router (server components + one client component), Prisma (Postgres/Supabase), Zod for API validation, Tailwind for styling.

## Global Constraints

- No test framework is configured in this project (no jest/vitest, no `test` script in `package.json`). Verification steps in this plan use `npx tsc --noEmit`, `curl` against the running dev server, and manual browser checks instead of automated tests.
- Prisma workflow in this repo is `prisma db push` (no `prisma/migrations` directory exists) — schema changes go live immediately against the connected Supabase database. **Confirm with the user immediately before running `db push` in Task 1.**
- Follow the existing per-component pattern of declaring a local, minimal `Order`/`OrderItem` type in each file rather than importing a shared type — that's what `kitchen-board.tsx` and `orders-board.tsx` already do.
- Dark theme convention already established elsewhere in the codebase: `stone-950` page backgrounds, `stone-900` cards with `stone-800` borders, white headings/primary text, `stone-300`/`stone-400`/`stone-500` for secondary text (lighter → more muted), `amber-400` for text accents/links, `amber-700`/`amber-800` (hover) for solid buttons — never `amber-400` as a button background.
- Dev server is already running at `http://localhost:3000` in the background (started earlier this session). Reuse it for smoke checks — don't start a second one.

---

### Task 1: Add `estimated_ready_at` column and push schema

**Files:**
- Modify: `prisma/schema.prisma:63-96` (the `orders` model)

**Interfaces:**
- Produces: `orders.estimated_ready_at` — nullable `DateTime` column, available to Prisma Client as `estimated_ready_at: Date | null` on any `db.orders.*` result.

- [ ] **Step 1: Add the column to the schema**

In `prisma/schema.prisma`, inside `model orders { ... }`, add the new field right after `scheduled_for`:

```prisma
  scheduled_for              DateTime?
  estimated_ready_at         DateTime?
  created_at                 DateTime @default(now())
```

- [ ] **Step 2: Confirm with the user, then push the schema change**

Tell the user: "About to run `prisma db push` to add `estimated_ready_at` to the live `orders` table in Supabase — confirm before I proceed." Wait for explicit confirmation.

Then run:

```bash
npx prisma db push
```

Expected: output ends with `Your database is now in sync with your Prisma schema.` and it regenerates the Prisma Client automatically.

- [ ] **Step 3: Verify the client picked up the new field**

```bash
grep -n "estimated_ready_at" node_modules/.prisma/client/index.d.ts | head -3
```

Expected: at least one match (confirms the generated client knows about the field).

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors (this task doesn't touch any `.ts`/`.tsx` files, just confirms nothing else in the repo broke).

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma
git commit -m "Add estimated_ready_at column to orders"
```

---

### Task 2: Accept `estimatedMinutes` in the order-update API

**Files:**
- Modify: `src/app/api/admin/orders/[id]/route.ts`

**Interfaces:**
- Consumes: `orders.estimated_ready_at` from Task 1.
- Produces: `PATCH /api/admin/orders/[id]` now accepts an optional JSON field `estimatedMinutes: number` (positive integer). When present, the response body's `estimated_ready_at` is set to `now + estimatedMinutes` minutes (ISO string, since it crosses the JSON boundary). Existing `status`/`paymentStatus` behavior is unchanged.

- [ ] **Step 1: Extend the Zod schema and update handler**

Replace the full contents of `src/app/api/admin/orders/[id]/route.ts` with:

```ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { z } from "zod";

const schema = z.object({
  status: z.enum(["pending", "confirmed", "preparing", "ready", "out_for_delivery", "delivered", "cancelled"]).optional(),
  paymentStatus: z.enum(["pending", "paid", "refunded", "failed"]).optional(),
  estimatedMinutes: z.number().int().positive().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const updateData: any = {
      updated_at: new Date(),
    };
    if (data.status !== undefined) updateData.status = data.status;
    if (data.paymentStatus !== undefined) updateData.payment_status = data.paymentStatus;
    if (data.estimatedMinutes !== undefined) {
      updateData.estimated_ready_at = new Date(Date.now() + data.estimatedMinutes * 60_000);
    }

    const updated = await db.orders.update({
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
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Smoke-test against a real order**

Find a `pending` order id to test with:

```bash
curl -s "http://localhost:3000/api/admin/orders" 2>/dev/null | head -c 500 || echo "no list endpoint — grab an id from the admin UI or Prisma Studio instead"
```

(There may be no GET list endpoint at this path — if so, get an existing pending order's `id` via `npx prisma studio` or from the Kitchen page you already have open, then substitute it below. If there are no orders in the database at all, skip this smoke test and rely on Task 4's end-to-end browser check instead.)

```bash
curl -s -X PATCH "http://localhost:3000/api/admin/orders/<ORDER_ID>" \
  -H "Content-Type: application/json" \
  -d '{"status":"confirmed","estimatedMinutes":15}' | python3 -m json.tool
```

Expected: JSON response with `"status": "confirmed"` and `"estimated_ready_at"` set to a timestamp ~15 minutes from now.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/admin/orders/[id]/route.ts
git commit -m "Accept estimatedMinutes in order PATCH endpoint"
```

---

### Task 3: Broaden Kitchen page's order fetch and apply dark theme to the page shell

**Files:**
- Modify: `src/app/admin/kitchen/page.tsx`

**Interfaces:**
- Consumes: `orders.estimated_ready_at` (Task 1).
- Produces: `AdminKitchenPage` passes `KitchenBoard` an `initialOrders` array where each order has an `estimatedReadyAt: Date | null` field and a `status: string` field — both are new/changed compared to the current version, so Task 4 (which rewrites `KitchenBoard`) depends on this shape.

- [ ] **Step 1: Replace the page's data-fetch and JSX**

Replace the full contents of `src/app/admin/kitchen/page.tsx` with:

```tsx
import { db } from "@/db";
import { KitchenBoard } from "@/components/admin/kitchen-board";

async function getKitchenOrders() {
  try {
    const ordersRaw = await db.orders.findMany({
      where: { status: { in: ["pending", "confirmed", "preparing"] } },
      include: { items: true },
      orderBy: { created_at: "asc" },
      take: 100,
    });
    return ordersRaw.map((o) => ({
      id: o.id,
      orderNumber: o.order_number,
      customerName: o.customer_name,
      customerPhone: o.customer_phone,
      orderType: o.order_type,
      status: o.status,
      total: o.total.toString(),
      specialInstructions: o.special_instructions,
      deliveryAddress: o.delivery_address,
      deliveryCity: o.delivery_city,
      createdAt: o.created_at,
      estimatedReadyAt: o.estimated_ready_at,
      items: o.items.map((i) => ({
        id: i.id,
        itemName: i.item_name,
        itemPrice: i.item_price.toString(),
        quantity: i.quantity,
        specialInstructions: i.special_instructions,
      })),
    }));
  } catch {
    return [];
  }
}

export default async function AdminKitchenPage() {
  const ordersList = await getKitchenOrders();

  return (
    <div className="relative overflow-hidden bg-stone-950 min-h-screen">
      <div className="absolute inset-0 bg-[url('/images/hero-bg.png')] bg-no-repeat bg-center bg-[length:auto_70%] opacity-[0.06]" />
      <div className="relative p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Kitchen</h1>
        <KitchenBoard initialOrders={ordersList} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: errors in `src/components/admin/kitchen-board.tsx` are OK at this point (its props type doesn't match yet — that's fixed in Task 4). No errors should appear in `src/app/admin/kitchen/page.tsx` itself.

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/kitchen/page.tsx
git commit -m "Fetch confirmed/preparing orders on Kitchen page, apply dark theme to shell"
```

---

### Task 4: Rewrite KitchenBoard with approve→prepare→ready sections and dark theme

**Files:**
- Modify: `src/components/admin/kitchen-board.tsx`

**Interfaces:**
- Consumes: `initialOrders` shape produced by Task 3 (`status: string`, `estimatedReadyAt: Date | null`, plus the existing fields already on the type).
- Produces: no other file depends on this component's internals beyond the `KitchenBoard` export and its `Props` shape, which stays `{ initialOrders: Order[] }`.

- [ ] **Step 1: Replace the full contents of `kitchen-board.tsx`**

```tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Phone, MapPin, Clock } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUSES, ORDER_STATUS_COLORS } from "@/lib/constants";

type OrderItem = {
  id: string;
  itemName: string;
  itemPrice: string;
  quantity: number;
  specialInstructions: string | null;
};

type Order = {
  id: string;
  orderNumber: number;
  customerName: string;
  customerPhone: string | null;
  orderType: string;
  status: string;
  total: string;
  specialInstructions: string | null;
  deliveryAddress: string | null;
  deliveryCity: string | null;
  createdAt: Date | null;
  estimatedReadyAt: Date | null;
  items: OrderItem[];
};

type Props = {
  initialOrders: Order[];
};

type UpdateBody =
  | { status: "confirmed"; estimatedMinutes: number }
  | { status: "preparing" }
  | { status: "ready" }
  | { status: "cancelled" };

const PREP_MINUTES = [10, 15, 20, 30];

const SECTIONS: { key: "pending" | "confirmed" | "preparing"; title: string }[] = [
  { key: "pending", title: "Pending" },
  { key: "confirmed", title: "Confirmed" },
  { key: "preparing", title: "Preparing" },
];

const UPDATE_TOAST_LABEL: Record<UpdateBody["status"], string> = {
  confirmed: "approved",
  preparing: "moved to preparing",
  ready: "marked ready",
  cancelled: "rejected",
};

function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function KitchenBoard({ initialOrders }: Props) {
  const [orders, setOrders] = useState(initialOrders);
  const [pickingId, setPickingId] = useState<string | null>(null);

  const updateOrder = async (orderId: string, body: UpdateBody) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update");
      const updated = await res.json();
      const order = orders.find((o) => o.id === orderId);

      if (body.status === "ready" || body.status === "cancelled") {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
      } else {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: body.status,
                  estimatedReadyAt: updated.estimated_ready_at ?? o.estimatedReadyAt,
                }
              : o
          )
        );
      }

      toast.success(`Order #${order?.orderNumber} ${UPDATE_TOAST_LABEL[body.status]}`);
    } catch {
      toast.error("Failed to update order");
    }
    setPickingId(null);
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 text-stone-400">
        <p>No orders in the kitchen right now.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {SECTIONS.map((section) => {
        const sectionOrders = orders.filter((o) => o.status === section.key);
        if (sectionOrders.length === 0) return null;

        return (
          <div key={section.key}>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400 mb-4">
              {section.title} ({sectionOrders.length})
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
              {sectionOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-stone-900 rounded-2xl border border-stone-800 p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-white">#{order.orderNumber}</p>
                      <p className="text-sm text-stone-300">{order.customerName}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize whitespace-nowrap ${
                        ORDER_STATUS_COLORS[order.status] ?? "bg-stone-800 text-stone-300"
                      }`}
                    >
                      {ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES] ?? order.status}
                    </span>
                  </div>

                  {order.estimatedReadyAt && (
                    <p className="text-xs font-medium text-amber-400">
                      Ready by {formatTime(order.estimatedReadyAt)}
                    </p>
                  )}

                  {order.customerPhone && (
                    <a
                      href={`tel:${order.customerPhone}`}
                      className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-amber-400 transition-colors"
                    >
                      <Phone className="h-3 w-3" />
                      {order.customerPhone}
                    </a>
                  )}

                  <div className="flex items-center gap-3 text-xs text-stone-500">
                    <span className="capitalize font-medium text-stone-300">{order.orderType}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {order.createdAt ? formatTime(order.createdAt) : "—"}
                    </span>
                  </div>

                  {order.orderType === "delivery" && order.deliveryAddress && (
                    <p className="flex items-start gap-1.5 text-xs text-stone-400">
                      <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                      {order.deliveryAddress}, {order.deliveryCity}
                    </p>
                  )}

                  <div className="border-t border-stone-800 pt-3 space-y-1">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-stone-300">
                          {item.itemName} × {item.quantity}
                        </span>
                        <span className="text-stone-500">
                          {formatPrice(Number(item.itemPrice) * item.quantity)}
                        </span>
                      </div>
                    ))}
                    {order.specialInstructions && (
                      <p className="text-xs text-stone-500 italic mt-1">
                        Note: {order.specialInstructions}
                      </p>
                    )}
                  </div>

                  <div className="border-t border-stone-800 pt-2 flex justify-between font-semibold text-white text-sm">
                    <span>Total</span>
                    <span>{formatPrice(Number(order.total))}</span>
                  </div>

                  {section.key === "pending" &&
                    (pickingId === order.id ? (
                      <div className="flex gap-2 flex-wrap">
                        {PREP_MINUTES.map((min) => (
                          <button
                            key={min}
                            onClick={() => updateOrder(order.id, { status: "confirmed", estimatedMinutes: min })}
                            className="px-3 py-1.5 rounded-xl bg-amber-700 text-white text-xs font-medium hover:bg-amber-800 transition-colors"
                          >
                            {min} min
                          </button>
                        ))}
                        <button
                          onClick={() => setPickingId(null)}
                          className="px-3 py-1.5 rounded-xl border border-stone-700 text-stone-300 text-xs font-medium hover:bg-stone-800 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPickingId(order.id)}
                          className="flex-1 py-2 rounded-xl bg-amber-700 text-white text-sm font-medium hover:bg-amber-800 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateOrder(order.id, { status: "cancelled" })}
                          className="flex-1 py-2 rounded-xl border border-red-900 text-red-400 text-sm font-medium hover:bg-red-950 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    ))}

                  {section.key === "confirmed" && (
                    <button
                      onClick={() => updateOrder(order.id, { status: "preparing" })}
                      className="w-full py-2 rounded-xl bg-amber-700 text-white text-sm font-medium hover:bg-amber-800 transition-colors"
                    >
                      Start Preparing
                    </button>
                  )}

                  {section.key === "preparing" && (
                    <button
                      onClick={() => updateOrder(order.id, { status: "ready" })}
                      className="w-full py-2 rounded-xl bg-amber-700 text-white text-sm font-medium hover:bg-amber-800 transition-colors"
                    >
                      Mark Ready
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors anywhere in the project now (this fixes the mismatch Task 3 introduced).

- [ ] **Step 3: Manual browser verification**

1. Open `http://localhost:3000/admin/kitchen` in a browser (log in as admin if prompted).
2. Confirm the page background is dark (`stone-950`) and any existing pending order shows in a "Pending" section with dark cards.
3. Click **Approve** on a pending order → confirm the 4 minute-choice buttons appear; click one (e.g. 15 min) → confirm a success toast appears, the order moves into a "Confirmed" section, and shows "Ready by HH:MM" in amber.
4. Click **Start Preparing** on that order → confirm it moves to a "Preparing" section, still showing the same "Ready by" time.
5. Click **Mark Ready** → confirm the order disappears from the Kitchen board entirely (it's now off the board, per the design).
6. If there are no real orders to test with, place one through the normal checkout flow first, or note in your report that this step needs a live order and was skipped.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/kitchen-board.tsx
git commit -m "Rewrite KitchenBoard: approve/prepare/ready sections, estimated time, dark theme"
```

---

### Task 5: Show estimated ready time on the customer order-status page

**Files:**
- Modify: `src/app/order/[id]/page.tsx`

**Interfaces:**
- Consumes: `orders.estimated_ready_at` (Task 1).

- [ ] **Step 1: Add the field to the mapped order object**

In `src/app/order/[id]/page.tsx`, find this block (currently around line 56-57):

```ts
      accessToken: orderRaw.access_token,
      scheduledFor: orderRaw.scheduled_for,
```

Change it to:

```ts
      accessToken: orderRaw.access_token,
      scheduledFor: orderRaw.scheduled_for,
      estimatedReadyAt: orderRaw.estimated_ready_at,
```

- [ ] **Step 2: Render the ETA line**

Find this block (currently around lines 91-97):

```tsx
        <span
          className={`inline-block mt-3 px-3 py-1 rounded-full text-sm font-medium ${
            ORDER_STATUS_COLORS[order.status] ?? "bg-stone-100 text-stone-700"
          }`}
        >
          {order.status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
        </span>
```

Add directly after the closing `</span>`:

```tsx
        {order.estimatedReadyAt && (order.status === "confirmed" || order.status === "preparing") && (
          <p className="text-sm text-amber-700 font-medium mt-2">
            Estimated ready by{" "}
            {new Date(order.estimatedReadyAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Manual browser verification**

1. Take the order id you approved with an estimated time in Task 4's manual check.
2. Visit `http://localhost:3000/order/<that-id>`.
3. Confirm "Estimated ready by HH:MM" appears under the status badge, matching the time shown on the Kitchen board.
4. If that order was already marked "ready" during Task 4's test, approve a fresh order first so its status is `confirmed` or `preparing` when you check this page.

- [ ] **Step 5: Commit**

```bash
git add src/app/order/[id]/page.tsx
git commit -m "Show estimated ready time on customer order-status page"
```

---

## Self-Review Notes

- **Spec coverage:** Data model (Task 1), API (Task 2), Kitchen board sections + ETA picker + dark theme (Tasks 3-4), customer ETA display (Task 5), navbar (explicitly out of scope, no task needed). All spec sections covered.
- **Type consistency:** `estimatedMinutes` (API), `estimatedReadyAt` (client-side camelCase), `estimated_ready_at` (Prisma/DB/API-response snake_case) used consistently in the same direction each crosses a boundary, matching the existing snake_case↔camelCase convention already used throughout this codebase (e.g. `order_number` ↔ `orderNumber`).
- **No placeholders:** all steps contain full code, not descriptions of code.
