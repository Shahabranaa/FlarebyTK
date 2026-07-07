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
    if (!/^\d+$/.test(id)) {
      return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
    }
    const orderId = Number.parseInt(id, 10);
    const body = (await request.json().catch(() => null)) as Record<
      string,
      unknown
    > | null;
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const sets: string[] = [];
    const values: unknown[] = [];

    if (body.status !== undefined) {
      if (
        typeof body.status !== "string" ||
        !VALID_STATUSES.includes(body.status)
      ) {
        return NextResponse.json(
          { error: `status must be one of: ${VALID_STATUSES.join(", ")}` },
          { status: 400 },
        );
      }
      values.push(body.status);
      sets.push(`status = $${values.length}`);
    }
    if (body.pos_number !== undefined) {
      if (body.pos_number !== null && typeof body.pos_number !== "string") {
        return NextResponse.json(
          { error: "pos_number must be a string or null" },
          { status: 400 },
        );
      }
      const pos =
        typeof body.pos_number === "string" ? body.pos_number.trim() : null;
      values.push(pos || null);
      sets.push(`pos_number = $${values.length}`);
    }
    if (body.rider_id !== undefined) {
      let riderId: number | null = null;
      if (body.rider_id !== null && body.rider_id !== "") {
        if (!/^\d+$/.test(String(body.rider_id))) {
          return NextResponse.json(
            { error: "rider_id must be a number or null" },
            { status: 400 },
          );
        }
        riderId = Number.parseInt(String(body.rider_id), 10);
        if (Number.isNaN(riderId)) {
          return NextResponse.json(
            { error: "rider_id must be a number or null" },
            { status: 400 },
          );
        }
        const [rider] = await sql(`SELECT id FROM riders WHERE id = $1`, [
          riderId,
        ]);
        if (!rider) {
          return NextResponse.json(
            { error: "Rider not found" },
            { status: 400 },
          );
        }
      }
      values.push(riderId);
      sets.push(`rider_id = $${values.length}`);
    }

    if (sets.length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    values.push(orderId);
    const rows = await sql(
      `UPDATE orders SET ${sets.join(", ")}, updated_at = NOW()
       WHERE id = $${values.length}
       RETURNING id, tracking_token, status, pos_number, rider_id, updated_at`,
      values,
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
