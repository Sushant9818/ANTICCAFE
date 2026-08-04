import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { z } from "zod";

const schema = z.object({
  number: z.number().int().positive(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const table = await db.tables.create({ data: { number: data.number } });
    return NextResponse.json(table, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    if (err && typeof err === "object" && (err as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "Table number already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create table" }, { status: 500 });
  }
}
