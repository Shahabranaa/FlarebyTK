import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAdmin } from "@/lib/admin";
import { COUPON_COLUMNS } from "@/lib/coupons";
import { parseCouponBody } from "@/lib/coupon-parse";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const coupons = await sql(
      `SELECT ${COUPON_COLUMNS},
              (SELECT name FROM menu_items m WHERE m.id = coupons.item_id) AS item_name,
              (SELECT name FROM categories c WHERE c.id = coupons.category_id) AS category_name
       FROM coupons
       ORDER BY created_at DESC`,
    );
    return NextResponse.json(coupons);
  } catch (err) {
    console.error("GET /api/coupons failed", err);
    return NextResponse.json(
      { error: "Failed to load coupons" },
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
    const parsed = parseCouponBody(body);
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    try {
      const [row] = await sql(
        `INSERT INTO coupons
           (code, description, discount_type, discount_value, scope, item_id,
            category_id, min_order_amount, starts_at, ends_at, days_of_week,
            max_uses, is_active)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         RETURNING ${COUPON_COLUMNS}`,
        [
          parsed.code,
          parsed.description,
          parsed.discount_type,
          parsed.discount_value,
          parsed.scope,
          parsed.item_id,
          parsed.category_id,
          parsed.min_order_amount,
          parsed.starts_at,
          parsed.ends_at,
          parsed.days_of_week,
          parsed.max_uses,
          parsed.is_active,
        ],
      );
      return NextResponse.json(row, { status: 201 });
    } catch (err) {
      if ((err as { code?: string })?.code === "23505") {
        return NextResponse.json(
          { error: "A coupon with this code already exists." },
          { status: 409 },
        );
      }
      throw err;
    }
  } catch (err) {
    console.error("POST /api/coupons failed", err);
    return NextResponse.json(
      { error: "Failed to create coupon" },
      { status: 500 },
    );
  }
}
