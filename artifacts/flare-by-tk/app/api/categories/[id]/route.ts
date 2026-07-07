import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAdmin } from "@/lib/admin";

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

    const sets: string[] = [];
    const values: unknown[] = [];
    const push = (col: string, val: unknown) => {
      values.push(val);
      sets.push(`${col} = $${values.length}`);
    };

    if (body.name !== undefined) {
      const name = typeof body.name === "string" ? body.name.trim() : "";
      if (!name) {
        return NextResponse.json(
          { error: "Name cannot be empty" },
          { status: 400 },
        );
      }
      push("name", name);
    }
    if (body.description !== undefined) {
      push(
        "description",
        typeof body.description === "string" && body.description.trim()
          ? body.description.trim()
          : null,
      );
    }
    if (body.sort_order !== undefined) {
      const n = Number(body.sort_order);
      if (!Number.isFinite(n)) {
        return NextResponse.json(
          { error: "sort_order must be a number" },
          { status: 400 },
        );
      }
      push("sort_order", Math.trunc(n));
    }
    if (body.is_active !== undefined) {
      push("is_active", !!body.is_active);
    }
    if (sets.length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    values.push(id);
    const [row] = await sql(
      `UPDATE categories SET ${sets.join(", ")}, updated_at = NOW()
       WHERE id = $${values.length}
       RETURNING id, name, slug, description, image_url, sort_order, is_active`,
      values,
    );
    if (!row) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    return NextResponse.json(row);
  } catch (err) {
    console.error("PATCH /api/categories/[id] failed", err);
    return NextResponse.json(
      { error: "Failed to update category" },
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
    const [{ count }] = await sql<{ count: number }>(
      `SELECT COUNT(*)::int AS count FROM menu_items WHERE category_id = $1`,
      [id],
    );
    if (count > 0) {
      return NextResponse.json(
        {
          error: `This category still has ${count} menu item${count === 1 ? "" : "s"}. Move or delete them first.`,
        },
        { status: 409 },
      );
    }
    const [row] = await sql(
      `DELETE FROM categories WHERE id = $1 RETURNING id`,
      [id],
    );
    if (!row) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error("DELETE /api/categories/[id] failed", err);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 },
    );
  }
}
