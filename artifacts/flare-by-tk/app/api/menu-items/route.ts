import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAdmin } from "@/lib/admin";
import { slugify, uniqueSuffix } from "@/lib/slugify";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (searchParams.get("available") === "true") {
      // Public queries: hide unavailable items and items whose category is
      // hidden (uncategorized items are grouped nowhere public, keep them out).
      conditions.push("m.is_available = TRUE");
      conditions.push("c.id IS NOT NULL AND c.is_active = TRUE");
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
    const price = Number(body?.price);
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        { error: "Price must be a positive number" },
        { status: 400 },
      );
    }
    const categoryId = Number.parseInt(String(body?.category_id), 10);
    if (Number.isNaN(categoryId)) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 },
      );
    }
    const [category] = await sql(
      `SELECT id FROM categories WHERE id = $1`,
      [categoryId],
    );
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 400 });
    }

    const description =
      typeof body?.description === "string" && body.description.trim()
        ? body.description.trim()
        : null;
    const originalPrice =
      body?.original_price === null ||
      body?.original_price === undefined ||
      body?.original_price === ""
        ? null
        : Number(body.original_price);
    if (originalPrice !== null && (!Number.isFinite(originalPrice) || originalPrice <= 0)) {
      return NextResponse.json(
        { error: "Original price must be a positive number" },
        { status: 400 },
      );
    }
    const calories =
      body?.calories === null || body?.calories === undefined || body?.calories === ""
        ? null
        : Math.trunc(Number(body.calories));
    if (calories !== null && !Number.isFinite(calories)) {
      return NextResponse.json(
        { error: "Calories must be a number" },
        { status: 400 },
      );
    }
    const imageUrl =
      typeof body?.image_url === "string" && body.image_url.trim()
        ? body.image_url.trim()
        : null;
    const isAvailable = body?.is_available === undefined ? true : !!body.is_available;
    const isFeatured = !!body?.is_featured;

    let slug = slugify(name);
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const [row] = await sql(
          `INSERT INTO menu_items
             (name, slug, description, category_id, price, original_price,
              image_url, is_available, is_featured, calories)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           RETURNING id, name, slug, description, category_id, price,
                     original_price, image_url, is_available, is_featured, calories, tags`,
          [
            name,
            slug,
            description,
            categoryId,
            price,
            originalPrice,
            imageUrl,
            isAvailable,
            isFeatured,
            calories,
          ],
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
      { error: "Failed to create menu item" },
      { status: 500 },
    );
  } catch (err) {
    console.error("POST /api/menu-items failed", err);
    return NextResponse.json(
      { error: "Failed to create menu item" },
      { status: 500 },
    );
  }
}
