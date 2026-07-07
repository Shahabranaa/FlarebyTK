import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAdmin } from "@/lib/admin";

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
    const rows = await sql<{ id: number; name: string; price: string }>(
      `SELECT id, name, price FROM menu_items
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
    }

    const totalAmount =
      subtotal + (orderType === "delivery" ? DELIVERY_FEE : 0);

    const inserted = await sql<{
      id: number;
      tracking_token: string;
      status: string;
      total_amount: string;
      created_at: string;
    }>(
      `INSERT INTO orders
         (customer_name, customer_phone, customer_address, order_type,
          special_instructions, total_amount, items)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
       RETURNING id, tracking_token, status, total_amount, created_at`,
      [
        customerName.trim(),
        customerPhone.trim(),
        typeof customerAddress === "string" ? customerAddress.trim() : null,
        orderType,
        typeof specialInstructions === "string"
          ? specialInstructions.trim() || null
          : null,
        totalAmount,
        JSON.stringify(orderItems),
      ],
    );

    const order = inserted[0];
    return NextResponse.json(
      {
        id: order.id,
        trackingToken: order.tracking_token,
        status: order.status,
        totalAmount: Number(order.total_amount),
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
              special_instructions, items, created_at, updated_at
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
