# Kitchen Workflow: Approve → Prepare → Ready, with Estimated Time

## Problem

The Kitchen page (`/admin/kitchen`) currently only handles the first step of
an order's life: approve (`pending → confirmed`) or reject (`pending →
cancelled`). The rest of the pipeline (`confirmed → preparing → ready`)
lives on a separate Admin Orders page, so the chef has to switch screens
mid-order. There's also no way to communicate a prep-time estimate to the
customer — the order-status page shows a progress bar but no ETA.

## Goals

- Let the chef drive an order from approval through to "ready" from one
  screen (the Kitchen page).
- Let the chef set an estimated ready time when approving, and surface it
  to the customer on their order-status page.
- Restyle the Kitchen page and board to the site's dark/gold theme
  (already applied to home, menu, about) for visual consistency.

## Non-goals

- No changes to the public navbar (admin sidebar already links to Kitchen).
- No changes to delivery/pickup progression after "ready" — that stays on
  the existing Admin Orders page.
- No redesign of the customer-facing order-status page beyond adding the
  ETA line — it stays in its current light theme.

## Data model

Add one nullable column to `orders`:

```prisma
estimated_ready_at DateTime?
```

Set by the server when the chef approves with a chosen prep time
(`now + minutes`). Cleared implicitly by simply not being read once the
order moves past "ready" (no explicit clear needed — the Kitchen board
stops showing the order at that point).

Applied via `prisma db push` against the Supabase database — confirmed
with the user immediately before running, since it's a live-DB schema
change.

## API

`PATCH /api/admin/orders/[id]` (`src/app/api/admin/orders/[id]/route.ts`)
gains an optional field:

```ts
estimatedMinutes: z.number().int().positive().optional()
```

When present, the handler computes `estimated_ready_at = new Date(Date.now() + estimatedMinutes * 60_000)`
and includes it in the update. `status` continues to accept the existing
full enum (`pending`, `confirmed`, `preparing`, `ready`,
`out_for_delivery`, `delivered`, `cancelled`) — no enum change needed.

## Kitchen board (`src/components/admin/kitchen-board.tsx`)

Fetch orders with `status in [pending, confirmed, preparing]` (currently
only `pending`) — done in `src/app/admin/kitchen/page.tsx`.

Render three sections, one per status, each with its own action:

| Status | Section shows | Action |
|---|---|---|
| `pending` | order details, no ETA yet | **Approve** → inline picker (10/15/20/30 min) sets `confirmed` + `estimatedMinutes`; **Reject** → `cancelled` |
| `confirmed` | "Ready by HH:MM" from `estimated_ready_at` | **Start Preparing** → `preparing` |
| `preparing` | "Ready by HH:MM" | **Mark Ready** → `ready` (order then leaves the Kitchen board) |

Visual: `stone-950` page background, `stone-900` cards with `stone-800`
borders, white text, amber-400 for the ETA and accents, amber-700 buttons
(matches the convention already used across the site — buttons stay
amber-700/800, amber-400 is for text accents only).

## Customer order page (`src/app/order/[id]/page.tsx`)

One additional line under the status badge: "Estimated ready by HH:MM",
shown only when `estimated_ready_at` is set and `status` is `confirmed`
or `preparing`. Formatted with `toLocaleTimeString`. No other changes to
this page.

## Out of scope / explicitly deferred

- Public navbar changes.
- Redesigning the customer order-status page's theme.
- Editing/canceling an estimate once set (chef can still reject/cancel
  the order entirely if something changes).
