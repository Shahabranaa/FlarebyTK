import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

const VALID_STATUSES = ["new", "preparing", "ready", "delivered", "cancelled"];

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await context.params;
    const orderId = Number.parseInt(id, 10);
    if (Number.isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
    }
    const body = await request.json().catch(() => null);
    const status = (body as Record<string, unknown>)?.status;
    if (typeof status !== "string" || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 },
      );
    }
    const rows = await sql(
      `UPDATE orders SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, tracking_token, status, updated_at`,
      [status, orderId],
    );
    if (rows.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("PATCH /api/orders/[id] failed", err);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 },
    );
  }
}
