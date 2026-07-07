"use client";

import { useCallback, useEffect, useState } from "react";
import { ImageOff, Pencil, Plus, Trash2 } from "lucide-react";
import ImageField from "./ImageField";
import {
  AdminCategory,
  AdminMenuItem,
  inputCls,
  labelCls,
  primaryBtn,
  rs,
  secondaryBtn,
} from "./types";

interface FormState {
  id: number | null;
  name: string;
  description: string;
  category_id: string;
  price: string;
  original_price: string;
  calories: string;
  image_url: string;
  is_available: boolean;
  is_featured: boolean;
}

export default function MenuTab({
  refreshKey,
  onUnauthorized,
}: {
  refreshKey: number;
  onUnauthorized: () => void;
}) {
  const [items, setItems] = useState<AdminMenuItem[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [filterCat, setFilterCat] = useState<string>("all");
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [itemsRes, catsRes] = await Promise.all([
      fetch("/api/menu-items"),
      fetch("/api/categories?all=true"),
    ]);
    if (itemsRes.status === 401 || catsRes.status === 401) {
      onUnauthorized();
      return;
    }
    if (itemsRes.ok) setItems(await itemsRes.json());
    if (catsRes.ok) setCategories(await catsRes.json());
  }, [onUnauthorized]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  function openAdd() {
    setError(null);
    setForm({
      id: null,
      name: "",
      description: "",
      category_id:
        filterCat !== "all" ? filterCat : String(categories[0]?.id ?? ""),
      price: "",
      original_price: "",
      calories: "",
      image_url: "",
      is_available: true,
      is_featured: false,
    });
  }

  function openEdit(item: AdminMenuItem) {
    setError(null);
    setForm({
      id: item.id,
      name: item.name,
      description: item.description ?? "",
      category_id: item.category_id === null ? "" : String(item.category_id),
      price: String(Number(item.price)),
      original_price:
        item.original_price === null ? "" : String(Number(item.original_price)),
      calories: item.calories === null ? "" : String(item.calories),
      image_url: item.image_url ?? "",
      is_available: item.is_available,
      is_featured: item.is_featured,
    });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setError(null);
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        category_id: form.category_id,
        price: form.price,
        original_price: form.original_price === "" ? null : form.original_price,
        calories: form.calories === "" ? null : form.calories,
        image_url: form.image_url,
        is_available: form.is_available,
        is_featured: form.is_featured,
      };
      const res = await fetch(
        form.id === null ? "/api/menu-items" : `/api/menu-items/${form.id}`,
        {
          method: form.id === null ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (res.status === 401) {
        onUnauthorized();
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || "Save failed");
        return;
      }
      setForm(null);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function remove(item: AdminMenuItem) {
    if (
      !window.confirm(`Delete "${item.name}" from the menu? This cannot be undone.`)
    ) {
      return;
    }
    const res = await fetch(`/api/menu-items/${item.id}`, { method: "DELETE" });
    if (res.status === 401) {
      onUnauthorized();
      return;
    }
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      window.alert(data?.error || "Delete failed");
      return;
    }
    await load();
  }

  async function toggle(
    item: AdminMenuItem,
    field: "is_available" | "is_featured",
  ) {
    const res = await fetch(`/api/menu-items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: !item[field] }),
    });
    if (res.ok) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, [field]: !item[field] } : i,
        ),
      );
    }
  }

  const filtered =
    filterCat === "all"
      ? items
      : items.filter((i) => String(i.category_id) === filterCat);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-[#ff6b1a]"
        >
          <option value="all">All categories ({items.length})</option>
          {categories.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.name} ({c.item_count})
            </option>
          ))}
        </select>
        <button onClick={openAdd} className={`${primaryBtn} flex items-center gap-2`}>
          <Plus className="h-4 w-4" /> Add Item
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-zinc-800">
        {filtered.map((item, idx) => (
          <div
            key={item.id}
            className={`flex flex-wrap items-center gap-3 bg-zinc-900 px-4 py-3 ${idx > 0 ? "border-t border-zinc-800" : ""}`}
          >
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-800">
              {item.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-zinc-600">
                  <ImageOff className="h-4 w-4" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-white">{item.name}</p>
              <p className="truncate text-xs text-zinc-500">
                {item.category_name ?? "No category"} · {rs(item.price)}
                {item.original_price
                  ? ` (was ${rs(item.original_price)})`
                  : ""}
              </p>
            </div>
            <button
              onClick={() => toggle(item, "is_available")}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                item.is_available
                  ? "bg-green-500/15 text-green-400"
                  : "bg-zinc-700 text-zinc-300"
              }`}
            >
              {item.is_available ? "Available" : "Unavailable"}
            </button>
            <button
              onClick={() => toggle(item, "is_featured")}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                item.is_featured
                  ? "bg-[#ff6b1a]/15 text-[#ff6b1a]"
                  : "bg-zinc-800 text-zinc-500"
              }`}
            >
              {item.is_featured ? "★ Featured" : "☆ Feature"}
            </button>
            <button
              onClick={() => openEdit(item)}
              className="rounded-lg border border-zinc-700 p-2 text-zinc-300 transition-colors hover:border-[#ff6b1a] hover:text-white"
              aria-label={`Edit ${item.name}`}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => remove(item)}
              className="rounded-lg border border-zinc-700 p-2 text-zinc-300 transition-colors hover:border-red-500 hover:text-red-400"
              aria-label={`Delete ${item.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="bg-zinc-900 px-4 py-8 text-center text-zinc-400">
            No items in this category yet.
          </p>
        )}
      </div>

      {form && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4">
          <form
            onSubmit={save}
            className="my-8 w-full max-w-lg space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6"
          >
            <h2 className="font-heading text-2xl tracking-wide text-white">
              {form.id === null ? "ADD" : "EDIT"}{" "}
              <span className="text-[#ff6b1a]">MENU ITEM</span>
            </h2>
            <div>
              <label className={labelCls}>Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputCls}
                required
              />
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={2}
                className={inputCls}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Category *</label>
                <select
                  value={form.category_id}
                  onChange={(e) =>
                    setForm({ ...form, category_id: e.target.value })
                  }
                  className={inputCls}
                  required
                >
                  <option value="" disabled>
                    Choose…
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Price (Rs.) *</label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Old price (optional)</label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={form.original_price}
                  onChange={(e) =>
                    setForm({ ...form, original_price: e.target.value })
                  }
                  placeholder="Shows as strikethrough"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Calories (optional)</label>
                <input
                  type="number"
                  min="0"
                  value={form.calories}
                  onChange={(e) =>
                    setForm({ ...form, calories: e.target.value })
                  }
                  className={inputCls}
                />
              </div>
            </div>
            <ImageField
              value={form.image_url}
              onChange={(v) => setForm({ ...form, image_url: v })}
            />
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={form.is_available}
                  onChange={(e) =>
                    setForm({ ...form, is_available: e.target.checked })
                  }
                  className="h-4 w-4 accent-[#ff6b1a]"
                />
                Available
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) =>
                    setForm({ ...form, is_featured: e.target.checked })
                  }
                  className="h-4 w-4 accent-[#ff6b1a]"
                />
                Featured (Most Selling)
              </label>
            </div>
            {error && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setForm(null)}
                className={secondaryBtn}
              >
                Cancel
              </button>
              <button type="submit" disabled={saving} className={primaryBtn}>
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
