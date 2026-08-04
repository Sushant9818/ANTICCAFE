import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { z } from "zod";

const schema = z.object({
  tableId: z.string().uuid(),
  serverName: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const existing = await db.dine_in_tabs.findFirst({
      where: { table_id: data.tableId, status: "open" },
    });
    if (existing) {
      return NextResponse.json({ tab: existing }, { status: 200 });
    }

    const tab = await db.dine_in_tabs.create({
      data: {
        table_id: data.tableId,
        server_name: data.serverName || null,
      },
    });
    return NextResponse.json({ tab }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to open tab" }, { status: 500 });
  }
}
