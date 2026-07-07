import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import {
  COUPON_COLUMNS,
  CouponLine,
  CouponRow,
  evaluateCoupon,
  normalizeCode,
} from "@/lib/coupons";

export const dynamic = "force-dynamic";

/**
 * Public preview endpoint: checks a coupon against the current cart and
 * returns the discount that would apply. The order endpoint re-validates
 * everything server-side at placement time.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const code = normalizeCode(body?.code);
    if (!code) {
      return NextResponse.json(
        { error: "Enter a coupon code." },
        { status: 400 },
      );
    }
    const items = Array.isArray(body?.items) ? body.items : [];
    const normalized: { id: number; qty: number }[] = [];
    for (const raw of items) {
      const id = Number(raw?.id);
      const qty = Number(raw?.qty);
      if (!Number.isInteger(id) || !Number.isInteger(qty) || qty < 1 || qty > 50) {
        return NextResponse.json({ error: "Invalid cart items" }, { status: 400 });
      }
      normalized.push({ id, qty });
    }
    if (normalized.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    const [coupon] = await sql<CouponRow>(
      `SELECT ${COUPON_COLUMNS} FROM coupons WHERE code = $1`,
      [code],
    );
    if (!coupon) {
      return NextResponse.json(
        { error: "That coupon code doesn’t exist." },
        { status: 404 },
      );
    }

    const rows = await sql<{ id: number; category_id: number | null; price: string }>(
      `SELECT id, category_id, price FROM menu_items
       WHERE id = ANY($1::int[]) AND is_available = TRUE`,
      [normalized.map((i) => i.id)],
    );
    const byId = new Map(rows.map((r) => [r.id, r]));
    const lines: CouponLine[] = [];
    let subtotal = 0;
    for (const item of normalized) {
      const row = byId.get(item.id);
      if (!row) continue;
      const price = Number(row.price);
      subtotal += price * item.qty;
      lines.push({
        itemId: row.id,
        categoryId: row.category_id,
        price,
        qty: item.qty,
      });
    }

    const result = evaluateCoupon(coupon, lines, subtotal);
    if (!result.ok) {
      return NextResponse.json({ error: result.reason }, { status: 400 });
    }
    return NextResponse.json({
      code: coupon.code,
      description: coupon.description,
      discount: result.discount,
    });
  } catch (err) {
    console.error("POST /api/coupons/validate failed", err);
    return NextResponse.json(
      { error: "Failed to check coupon" },
      { status: 500 },
    );
  }
}
