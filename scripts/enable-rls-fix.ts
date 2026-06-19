import { config } from "dotenv";
config({ path: ".env.local" });

import postgres from "postgres";

const sql = postgres(process.env.DIRECT_URL!, { prepare: false });

const statements = [
  `ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY`,
  `CREATE POLICY "public_read_active_categories" ON public.menu_categories FOR SELECT USING (is_active = true)`,
  `CREATE POLICY "public_read_own_order" ON public.orders FOR SELECT USING (access_token IS NOT NULL AND access_token = current_setting('request.jwt.claims', true)::json->>'access_token')`,
  `CREATE POLICY "public_insert_reservation" ON public.reservations FOR INSERT WITH CHECK (true)`,
];

async function run() {
  for (const stmt of statements) {
    try {
      await sql.unsafe(stmt);
      console.log("OK:", stmt.slice(0, 70));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("already exists")) {
        console.log("SKIP:", stmt.slice(0, 70));
      } else {
        console.error("ERR:", msg, "\n  ->", stmt.slice(0, 70));
      }
    }
  }
  await sql.end();
  console.log("\nDone.");
}

run();
