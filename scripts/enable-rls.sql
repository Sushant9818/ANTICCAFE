-- Enable RLS on every table
ALTER TABLE public.menu_categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promos             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_settings ENABLE ROW LEVEL SECURITY;

-- ── PUBLIC READ policies (menu display) ──────────────────────────────────────

CREATE POLICY "public_read_active_categories"
  ON public.menu_categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "public_read_available_items"
  ON public.menu_items FOR SELECT
  USING (is_available = true);

CREATE POLICY "public_read_settings"
  ON public.restaurant_settings FOR SELECT
  USING (true);

CREATE POLICY "public_read_active_promos"
  ON public.promos FOR SELECT
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- ── ORDER TRACKING: read own order by access token ───────────────────────────

CREATE POLICY "public_read_own_order"
  ON public.orders FOR SELECT
  USING (
    access_token IS NOT NULL
    AND access_token = current_setting('request.jwt.claims', true)::json->>'access_token'
  );

CREATE POLICY "public_read_own_order_items"
  ON public.order_items FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM public.orders
      WHERE access_token IS NOT NULL
        AND access_token = current_setting('request.jwt.claims', true)::json->>'access_token'
    )
  );

-- ── RESERVATIONS: allow anonymous insert only ────────────────────────────────

CREATE POLICY "public_insert_reservation"
  ON public.reservations FOR INSERT
  WITH CHECK (true);

-- ── Everything else (customers, staff) has NO public policies ────────────────
-- Blocked by default once RLS is enabled.
-- All server-side ops go through the direct Postgres connection (superuser)
-- which bypasses RLS entirely — no server breakage.
