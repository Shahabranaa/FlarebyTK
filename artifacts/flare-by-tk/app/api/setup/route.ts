import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { seedCategories, seedDeals, seedMenuItems } from "@/lib/seed";

export const dynamic = "force-dynamic";

function authorized(request: NextRequest): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  return request.nextUrl.searchParams.get("key") === adminPassword;
}

async function counts() {
  const rows = await sql<{
    categories: string;
    menu_items: string;
    deals: string;
    orders: string;
  }>(
    `SELECT
       (SELECT COUNT(*) FROM categories) AS categories,
       (SELECT COUNT(*) FROM menu_items) AS menu_items,
       (SELECT COUNT(*) FROM deals) AS deals,
       (SELECT COUNT(*) FROM orders) AS orders`,
  );
  const row = rows[0];
  return {
    categories: Number(row.categories),
    menuItems: Number(row.menu_items),
    deals: Number(row.deals),
    orders: Number(row.orders),
  };
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return NextResponse.json(await counts());
  } catch (err) {
    console.error("GET /api/setup failed", err);
    return NextResponse.json({ error: "Setup check failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const force = request.nextUrl.searchParams.get("force") === "true";
    const before = await counts();
    if (!force && before.menuItems > 0) {
      return NextResponse.json({
        message: "Data already seeded. Add ?force=true to re-seed.",
        ...before,
      });
    }

    if (force) {
      // Full re-seed: wipe menu data so removed items don't linger.
      // Orders are untouched (they snapshot item names/prices).
      await sql(`DELETE FROM deals`);
      await sql(`DELETE FROM menu_items`);
      await sql(`DELETE FROM categories`);
    }

    for (const cat of seedCategories) {
      await sql(
        `INSERT INTO categories (name, slug, description, image_url, sort_order, is_active)
         VALUES ($1, $2, $3, $4, $5, TRUE)
         ON CONFLICT (slug) DO UPDATE SET
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           image_url = EXCLUDED.image_url,
           sort_order = EXCLUDED.sort_order,
           is_active = TRUE,
           updated_at = NOW()`,
        [cat.name, cat.slug, cat.description, cat.image_url, cat.sort_order],
      );
    }

    const catRows = await sql<{ id: number; slug: string }>(
      `SELECT id, slug FROM categories`,
    );
    const catBySlug = new Map(catRows.map((c) => [c.slug, c.id]));

    for (const item of seedMenuItems) {
      const categoryId = catBySlug.get(item.category_slug);
      if (!categoryId) continue;
      await sql(
        `INSERT INTO menu_items
           (name, slug, description, category_id, price, original_price,
            image_url, is_available, is_featured, calories, tags)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (slug) DO UPDATE SET
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           category_id = EXCLUDED.category_id,
           price = EXCLUDED.price,
           original_price = EXCLUDED.original_price,
           image_url = EXCLUDED.image_url,
           is_available = EXCLUDED.is_available,
           is_featured = EXCLUDED.is_featured,
           calories = EXCLUDED.calories,
           tags = EXCLUDED.tags,
           updated_at = NOW()`,
        [
          item.name,
          item.slug,
          item.description,
          categoryId,
          item.price,
          item.original_price,
          item.image_url,
          item.is_available,
          item.is_featured,
          item.calories,
          item.tags,
        ],
      );
    }

    for (const deal of seedDeals) {
      const existing = await sql<{ id: number }>(
        `SELECT id FROM deals WHERE title = $1`,
        [deal.title],
      );
      if (existing.length > 0) {
        await sql(
          `UPDATE deals SET
             description = $2, image_url = $3, original_price = $4,
             deal_price = $5, discount_type = $6, discount_value = $7,
             is_active = TRUE, updated_at = NOW()
           WHERE title = $1`,
          [
            deal.title,
            deal.description,
            deal.image_url,
            deal.original_price,
            deal.deal_price,
            deal.discount_type,
            deal.discount_value,
          ],
        );
      } else {
        await sql(
          `INSERT INTO deals
             (title, description, image_url, original_price, deal_price,
              discount_type, discount_value, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)`,
          [
            deal.title,
            deal.description,
            deal.image_url,
            deal.original_price,
            deal.deal_price,
            deal.discount_type,
            deal.discount_value,
          ],
        );
      }
    }

    return NextResponse.json({
      message: "Seed complete",
      ...(await counts()),
    });
  } catch (err) {
    console.error("POST /api/setup failed", err);
    return NextResponse.json({ error: "Seeding failed" }, { status: 500 });
  }
}
