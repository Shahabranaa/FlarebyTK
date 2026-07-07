import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

function parseId(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const id = Number.parseInt(raw, 10);
  return id <= 0 || !Number.isSafeInteger(id) ? null : id;
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
    const sets: string[] = [];
    const values: unknown[] = [];
    if (typeof body.name === "string" && body.name.trim()) {
      values.push(body.name.trim());
      sets.push(`name = $${values.length}`);
    }
    if (typeof body.phone === "string" && body.phone.trim()) {
      values.push(body.phone.trim());
      sets.push(`phone = $${values.length}`);
    }
    if (typeof body.is_active === "boolean") {
      values.push(body.is_active);
      sets.push(`is_active = $${values.length}`);
    }
    if (sets.length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }
    values.push(id);
    const [rider] = await sql(
      `UPDATE riders SET ${sets.join(", ")}, updated_at = NOW()
       WHERE id = $${values.length}
       RETURNING id, name, phone, is_active, created_at`,
      values,
    );
    if (!rider) {
      return NextResponse.json({ error: "Rider not found" }, { status: 404 });
    }
    return NextResponse.json(rider);
  } catch (err) {
    console.error("PATCH /api/riders/[id] failed", err);
    return NextResponse.json(
      { error: "Failed to update rider" },
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
    const [row] = await sql(`DELETE FROM riders WHERE id = $1 RETURNING id`, [
      id,
    ]);
    if (!row) {
      return NextResponse.json({ error: "Rider not found" }, { status: 404 });
    }
    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error("DELETE /api/riders/[id] failed", err);
    return NextResponse.json(
      { error: "Failed to delete rider" },
      { status: 500 },
    );
  }
}
