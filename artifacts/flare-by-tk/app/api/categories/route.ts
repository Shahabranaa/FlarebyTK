import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await sql(
      `SELECT id, name, slug, description, image_url, sort_order, is_active
       FROM categories
       WHERE is_active = TRUE
       ORDER BY sort_order ASC, name ASC`,
    );
    return NextResponse.json(categories);
  } catch (err) {
    console.error("GET /api/categories failed", err);
    return NextResponse.json(
      { error: "Failed to load categories" },
      { status: 500 },
    );
  }
}
