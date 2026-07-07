import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAdmin } from "@/lib/admin";
import { COUPON_COLUMNS } from "@/lib/coupons";
import { parseCouponBody } from "@/lib/coupon-parse";

export const dynamic = "force-dynamic";

function parseId(raw: string): number | null {
  const id = Number.parseInt(raw, 10);
  return Number.isNaN(id) || id <= 0 ? null : id;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = parseId((await params).id);
  if (!id) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    // Quick toggle path: only is_active supplied.
    const keys = Object.keys(body);
    if (keys.length === 1 && keys[0] === "is_active") {
      const [row] = await sql(
        `UPDATE coupons SET is_active = $1, updated_at = NOW()
         WHERE id = $2 RETURNING ${COUPON_COLUMNS}`,
        [!!body.is_active, id],
      );
      if (!row) {
        return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
      }
      return NextResponse.json(row);
    }

    const parsed = parseCouponBody(body);
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    try {
      const [row] = await sql(
        `UPDATE coupons SET
           code = $1, description = $2, discount_type = $3, discount_value = $4,
           scope = $5, item_id = $6, category_id = $7, min_order_amount = $8,
           starts_at = $9, ends_at = $10, days_of_week = $11, max_uses = $12,
           is_active = $13, updated_at = NOW()
         WHERE id = $14
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
          id,
        ],
      );
      if (!row) {
        return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
      }
      return NextResponse.json(row);
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
    console.error("PATCH /api/coupons/[id] failed", err);
    return NextResponse.json(
      { error: "Failed to update coupon" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = parseId((await params).id);
  if (!id) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  try {
    const [row] = await sql(`DELETE FROM coupons WHERE id = $1 RETURNING id`, [
      id,
    ]);
    if (!row) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }
    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error("DELETE /api/coupons/[id] failed", err);
    return NextResponse.json(
      { error: "Failed to delete coupon" },
      { status: 500 },
    );
  }
}
