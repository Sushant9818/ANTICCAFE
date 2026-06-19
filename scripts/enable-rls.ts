import { config } from "dotenv";
config({ path: ".env.local" });

import postgres from "postgres";
import { readFileSync } from "fs";
import { join } from "path";

const sql = postgres(process.env.DIRECT_URL!, { prepare: false });

async function run() {
  const script = readFileSync(join(__dirname, "enable-rls.sql"), "utf8");
  // Split on semicolons, run each statement individually
  const statements = script
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  for (const stmt of statements) {
    try {
      await sql.unsafe(stmt);
      console.log("OK:", stmt.split("\n")[0].slice(0, 60));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("already exists")) {
        console.log("SKIP (exists):", stmt.split("\n")[0].slice(0, 60));
      } else {
        console.error("ERR:", msg);
      }
    }
  }

  await sql.end();
  console.log("\nDone.");
}

run();
