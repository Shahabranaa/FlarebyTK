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
    if (body.category_id !== undefined) {
      const categoryId = Number.parseInt(String(body.category_id), 10);
      if (Number.isNaN(categoryId)) {
        return NextResponse.json(
          { error: "category_id must be a number" },
          { status: 400 },
        );
      }
      const [category] = await sql(
        `SELECT id FROM categories WHERE id = $1`,
        [categoryId],
      );
      if (!category) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 400 },
        );
      }
      push("category_id", categoryId);
    }
    if (body.price !== undefined) {
      const price = Number(body.price);
      if (!Number.isFinite(price) || price <= 0) {
        return NextResponse.json(
          { error: "Price must be a positive number" },
          { status: 400 },
        );
      }
      push("price", price);
    }
    if (body.original_price !== undefined) {
      if (body.original_price === null || body.original_price === "") {
        push("original_price", null);
      } else {
        const op = Number(body.original_price);
        if (!Number.isFinite(op) || op <= 0) {
          return NextResponse.json(
            { error: "Original price must be a positive number" },
            { status: 400 },
          );
        }
        push("original_price", op);
      }
    }
    if (body.calories !== undefined) {
      if (body.calories === null || body.calories === "") {
        push("calories", null);
      } else {
        const cal = Number(body.calories);
        if (!Number.isFinite(cal)) {
          return NextResponse.json(
            { error: "Calories must be a number" },
            { status: 400 },
          );
        }
        push("calories", Math.trunc(cal));
      }
    }
    if (body.image_url !== undefined) {
      push(
        "image_url",
        typeof body.image_url === "string" && body.image_url.trim()
          ? body.image_url.trim()
          : null,
      );
    }
    if (body.is_available !== undefined) {
      push("is_available", !!body.is_available);
    }
    if (body.is_featured !== undefined) {
      push("is_featured", !!body.is_featured);
    }
    if (sets.length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    values.push(id);
    const [row] = await sql(
      `UPDATE menu_items SET ${sets.join(", ")}, updated_at = NOW()
       WHERE id = $${values.length}
       RETURNING id, name, slug, description, category_id, price,
                 original_price, image_url, is_available, is_featured, calories, tags`,
      values,
    );
    if (!row) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(row);
  } catch (err) {
    console.error("PATCH /api/menu-items/[id] failed", err);
    return NextResponse.json(
      { error: "Failed to update menu item" },
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
    const [row] = await sql(
      `DELETE FROM menu_items WHERE id = $1 RETURNING id`,
      [id],
    );
    if (!row) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error("DELETE /api/menu-items/[id] failed", err);
    return NextResponse.json(
      { error: "Failed to delete menu item" },
      { status: 500 },
    );
  }
}
