import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const activeOnly = request.nextUrl.searchParams.get("active") === "true";
    const deals = await sql(
      `SELECT id, title, description, image_url, original_price, deal_price,
              discount_type, discount_value, is_active
       FROM deals
       ${activeOnly ? "WHERE is_active = TRUE" : ""}
       ORDER BY id ASC`,
    );
    return NextResponse.json(deals);
  } catch (err) {
    console.error("GET /api/deals failed", err);
    return NextResponse.json(
      { error: "Failed to load deals" },
      { status: 500 },
    );
  }
}
