import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAdmin } from "@/lib/admin";
import { DEFAULT_TEMPLATES, TEMPLATE_KEYS } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

const KNOWN_KEYS = new Set<string>(Object.values(TEMPLATE_KEYS));

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const rows = await sql<{ key: string; value: string }>(
      `SELECT key, value FROM settings`,
    );
    const result: Record<string, string> = { ...DEFAULT_TEMPLATES };
    for (const row of rows) {
      if (KNOWN_KEYS.has(row.key)) result[row.key] = row.value;
    }
    return NextResponse.json(result);
  } catch (err) {
    console.error("GET /api/settings failed", err);
    return NextResponse.json(
      { error: "Failed to load settings" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const entries = Object.entries(body as Record<string, unknown>).filter(
      ([key, value]) => KNOWN_KEYS.has(key) && typeof value === "string",
    ) as [string, string][];
    if (entries.length === 0) {
      return NextResponse.json({ error: "Nothing to save" }, { status: 400 });
    }
    for (const [key, value] of entries) {
      await sql(
        `INSERT INTO settings (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, value],
      );
    }
    return NextResponse.json({ saved: true });
  } catch (err) {
    console.error("PUT /api/settings failed", err);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 },
    );
  }
}
