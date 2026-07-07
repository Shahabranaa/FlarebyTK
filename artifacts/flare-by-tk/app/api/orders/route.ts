import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { sql, withTransaction } from "@/lib/db";
import { isAdmin } from "@/lib/admin";
import {
  COUPON_COLUMNS,
  CouponLine,
  CouponRow,
  evaluateCoupon,
  normalizeCode,
} from "@/lib/coupons";

export const dynamic = "force-dynamic";

const DELIVERY_FEE = 150;

interface IncomingItem {
  id: number;
  qty: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const {
      customerName,
      customerPhone,
      customerAddress,
      orderType,
      specialInstructions,
      items,
      couponCode,
    } = body as Record<string, unknown>;

    if (typeof customerName !== "string" || !customerName.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (typeof customerPhone !== "string" || !customerPhone.trim()) {
      return NextResponse.json({ error: "Phone is required" }, { status: 400 });
    }
    if (orderType !== "delivery" && orderType !== "pickup") {
      return NextResponse.json(
        { error: "orderType must be 'delivery' or 'pickup'" },
        { status: 400 },
      );
    }
    if (
      orderType === "delivery" &&
      (typeof customerAddress !== "string" || !customerAddress.trim())
    ) {
      return NextResponse.json(
        { error: "Address is required for delivery orders" },
        { status: 400 },
      );
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const normalized: IncomingItem[] = [];
    for (const raw of items) {
      const id = Number((raw as Record<string, unknown>)?.id);
      const qty = Number((raw as Record<string, unknown>)?.qty);
      if (
        !Number.isInteger(id) ||
        !Number.isInteger(qty) ||
        qty < 1 ||
        qty > 50
      ) {
        return NextResponse.json(
          { error: "Invalid cart items" },
          { status: 400 },
        );
      }
      normalized.push({ id, qty });
    }

    const ids = normalized.map((i) => i.id);
    const rows = await sql<{
      id: number;
      name: string;
      price: string;
      category_id: number | null;
    }>(
      `SELECT id, name, price, category_id FROM menu_items
       WHERE id = ANY($1::int[]) AND is_available = TRUE`,
      [ids],
    );
    const byId = new Map(rows.map((r) => [r.id, r]));

    const orderItems: {
      id: number;
      name: string;
      price: number;
      qty: number;
    }[] = [];
    const lines: CouponLine[] = [];
    let subtotal = 0;
    for (const item of normalized) {
      const row = byId.get(item.id);
      if (!row) {
        return NextResponse.json(
          { error: `Item ${item.id} is not available` },
          { status: 400 },
        );
      }
      const price = Number(row.price);
      subtotal += price * item.qty;
      orderItems.push({ id: row.id, name: row.name, price, qty: item.qty });
      lines.push({
        itemId: row.id,
        categoryId: row.category_id,
        price,
        qty: item.qty,
      });
    }

    // Coupon validation + order insert run in a single transaction. The
    // coupon row is locked (FOR UPDATE) and used_count is incremented in the
    // same transaction, so concurrent orders can't over-redeem a limited
    // coupon, and a discounted order can't persist without consuming a use.
    const code = normalizeCode(couponCode);
    const outcome = await withTransaction<
      | { kind: "error"; message: string }
      | {
          kind: "ok";
          order: {
            id: number;
            tracking_token: string;
            status: string;
            total_amount: string;
            created_at: string;
          };
          discount: number;
          couponCode: string | null;
        }
    >(async (tx) => {
      let discount = 0;
      let appliedCoupon: CouponRow | null = null;
      if (code) {
        const [coupon] = await tx.sql<CouponRow>(
          `SELECT ${COUPON_COLUMNS} FROM coupons WHERE code = $1 FOR UPDATE`,
          [code],
        );
        if (!coupon) {
          return { kind: "error", message: "That coupon code doesn’t exist." };
        }
        const result = evaluateCoupon(coupon, lines, subtotal);
        if (!result.ok) {
          return { kind: "error", message: result.reason };
        }
        const updated = await tx.sql(
          `UPDATE coupons SET used_count = used_count + 1, updated_at = NOW()
           WHERE id = $1 AND (max_uses IS NULL OR used_count < max_uses)
           RETURNING id`,
          [coupon.id],
        );
        if (updated.length === 0) {
          return {
            kind: "error",
            message: "This coupon has been fully redeemed.",
          };
        }
        discount = result.discount;
        appliedCoupon = coupon;
      }

      const totalAmount =
        subtotal - discount + (orderType === "delivery" ? DELIVERY_FEE : 0);

      const inserted = await tx.sql<{
        id: number;
        tracking_token: string;
        status: string;
        total_amount: string;
        created_at: string;
      }>(
        `INSERT INTO orders
           (tracking_token, customer_name, customer_phone, customer_address, order_type,
            special_instructions, total_amount, items, coupon_code, discount_amount)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10)
         RETURNING id, tracking_token, status, total_amount, created_at`,
        [
          // Generated in app code — some managed Postgres setups lack a working
          // gen_random_uuid() default (pgcrypto unavailable), which made the DB
          // default silently absent and inserts fail with a NOT NULL violation.
          randomUUID(),
          customerName.trim(),
          customerPhone.trim(),
          typeof customerAddress === "string" ? customerAddress.trim() : null,
          orderType,
          typeof specialInstructions === "string"
            ? specialInstructions.trim() || null
            : null,
          totalAmount,
          JSON.stringify(orderItems),
          appliedCoupon ? appliedCoupon.code : null,
          discount,
        ],
      );
      return {
        kind: "ok",
        order: inserted[0],
        discount,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
      };
    });

    if (outcome.kind === "error") {
      return NextResponse.json({ error: outcome.message }, { status: 400 });
    }

    const order = outcome.order;
    return NextResponse.json(
      {
        id: order.id,
        trackingToken: order.tracking_token,
        status: order.status,
        totalAmount: Number(order.total_amount),
        discount: outcome.discount,
        couponCode: outcome.couponCode,
        createdAt: order.created_at,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("POST /api/orders failed", err);
    return NextResponse.json(
      { error: "Failed to place order" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const orders = await sql(
      `SELECT id, tracking_token, customer_name, customer_phone,
              customer_address, order_type, status, total_amount,
              special_instructions, items, coupon_code, discount_amount,
              created_at, updated_at
       FROM orders
       ORDER BY created_at DESC`,
    );
    return NextResponse.json(orders);
  } catch (err) {
    console.error("GET /api/orders failed", err);
    return NextResponse.json(
      { error: "Failed to load orders" },
      { status: 500 },
    );
  }
}
