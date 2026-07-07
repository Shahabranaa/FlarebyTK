import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await context.params;
    if (!UUID_RE.test(token)) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const rows = await sql(
      `SELECT id, tracking_token, customer_name, order_type, status,
              total_amount, items, created_at, updated_at
       FROM orders
       WHERE tracking_token = $1`,
      [token],
    );
    if (rows.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("GET /api/orders/track/[token] failed", err);
    return NextResponse.json(
      { error: "Failed to load order" },
      { status: 500 },
    );
  }
}
