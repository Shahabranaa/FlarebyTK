import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const riders = await sql(
      `SELECT id, name, phone, is_active, created_at FROM riders
       ORDER BY name ASC`,
    );
    return NextResponse.json(riders);
  } catch (err) {
    console.error("GET /api/riders failed", err);
    return NextResponse.json(
      { error: "Failed to load riders" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json().catch(() => null);
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!phone) {
      return NextResponse.json({ error: "Phone is required" }, { status: 400 });
    }
    const [rider] = await sql(
      `INSERT INTO riders (name, phone) VALUES ($1, $2)
       RETURNING id, name, phone, is_active, created_at`,
      [name, phone],
    );
    return NextResponse.json(rider, { status: 201 });
  } catch (err) {
    console.error("POST /api/riders failed", err);
    return NextResponse.json(
      { error: "Failed to add rider" },
      { status: 500 },
    );
  }
}
