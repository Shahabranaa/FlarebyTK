import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAdmin } from "@/lib/admin";
import { slugify, uniqueSuffix } from "@/lib/slugify";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const all = request.nextUrl.searchParams.get("all") === "true";
    if (all && !isAdmin(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const categories = await sql(
      `SELECT c.id, c.name, c.slug, c.description, c.image_url, c.sort_order, c.is_active,
              (SELECT COUNT(*)::int FROM menu_items m WHERE m.category_id = c.id) AS item_count
       FROM categories c
       ${all ? "" : "WHERE c.is_active = TRUE"}
       ORDER BY c.sort_order ASC, c.name ASC`,
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

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json().catch(() => null);
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const description =
      typeof body?.description === "string" ? body.description.trim() : null;
    const sortOrder = Number.isFinite(Number(body?.sort_order))
      ? Math.trunc(Number(body.sort_order))
      : 0;
    const isActive = body?.is_active === undefined ? true : !!body.is_active;

    let slug = slugify(name);
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const [row] = await sql(
          `INSERT INTO categories (name, slug, description, sort_order, is_active)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, name, slug, description, image_url, sort_order, is_active`,
          [name, slug, description, sortOrder, isActive],
        );
        return NextResponse.json(row, { status: 201 });
      } catch (err) {
        if ((err as { code?: string })?.code === "23505" && attempt === 0) {
          slug = `${slug}-${uniqueSuffix()}`;
          continue;
        }
        throw err;
      }
    }
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 },
    );
  } catch (err) {
    console.error("POST /api/categories failed", err);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 },
    );
  }
}
