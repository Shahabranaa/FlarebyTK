import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (searchParams.get("available") === "true") {
      conditions.push("m.is_available = TRUE");
    }
    if (searchParams.get("featured") === "true") {
      conditions.push("m.is_featured = TRUE");
    }
    const categoryId = searchParams.get("categoryId");
    if (categoryId) {
      const parsed = Number.parseInt(categoryId, 10);
      if (Number.isNaN(parsed)) {
        return NextResponse.json(
          { error: "categoryId must be a number" },
          { status: 400 },
        );
      }
      params.push(parsed);
      conditions.push(`m.category_id = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const items = await sql(
      `SELECT m.id, m.name, m.slug, m.description, m.category_id,
              m.price, m.original_price, m.image_url, m.is_available,
              m.is_featured, m.calories, m.tags,
              c.name AS category_name
       FROM menu_items m
       LEFT JOIN categories c ON c.id = m.category_id
       ${where}
       ORDER BY m.name ASC`,
      params,
    );
    return NextResponse.json(items);
  } catch (err) {
    console.error("GET /api/menu-items failed", err);
    return NextResponse.json(
      { error: "Failed to load menu items" },
      { status: 500 },
    );
  }
}
