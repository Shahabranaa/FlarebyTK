"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  AdminCategory,
  inputCls,
  labelCls,
  primaryBtn,
  secondaryBtn,
} from "./types";

interface FormState {
  id: number | null;
  name: string;
  description: string;
  sort_order: string;
  is_active: boolean;
}

const emptyForm: FormState = {
  id: null,
  name: "",
  description: "",
  sort_order: "0",
  is_active: true,
};

export default function CategoriesTab({
  onUnauthorized,
  onChanged,
}: {
  onUnauthorized: () => void;
  onChanged: () => void;
}) {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/categories?all=true");
    if (res.status === 401) {
      onUnauthorized();
      return;
    }
    if (res.ok) setCategories(await res.json());
  }, [onUnauthorized]);

  useEffect(() => {
    load();
  }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setError(null);
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        sort_order: Number(form.sort_order) || 0,
        is_active: form.is_active,
      };
      const res = await fetch(
        form.id === null ? "/api/categories" : `/api/categories/${form.id}`,
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
      onChanged();
    } finally {
      setSaving(false);
    }
  }

  async function remove(cat: AdminCategory) {
    if (
      !window.confirm(
        `Delete category "${cat.name}"? This cannot be undone.`,
      )
    ) {
      return;
    }
    const res = await fetch(`/api/categories/${cat.id}`, { method: "DELETE" });
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
    onChanged();
  }

  async function toggleActive(cat: AdminCategory) {
    const res = await fetch(`/api/categories/${cat.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !cat.is_active }),
    });
    if (res.ok) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === cat.id ? { ...c, is_active: !cat.is_active } : c,
        ),
      );
      onChanged();
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">
          {categories.length} categories · hidden categories don’t show on the
          menu
        </p>
        <button
          onClick={() => {
            setError(null);
            setForm({ ...emptyForm });
          }}
          className={`${primaryBtn} flex items-center gap-2`}
        >
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-zinc-800">
        {categories.map((cat, idx) => (
          <div
            key={cat.id}
            className={`flex flex-wrap items-center gap-3 bg-zinc-900 px-4 py-3 ${idx > 0 ? "border-t border-zinc-800" : ""}`}
          >
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-white">
                {cat.name}
                {!cat.is_active && (
                  <span className="ml-2 rounded-full bg-zinc-700 px-2 py-0.5 text-xs text-zinc-300">
                    hidden
                  </span>
                )}
              </p>
              <p className="truncate text-xs text-zinc-500">
                {cat.item_count} item{cat.item_count === 1 ? "" : "s"} · order{" "}
                {cat.sort_order}
                {cat.description ? ` · ${cat.description}` : ""}
              </p>
            </div>
            <button
              onClick={() => toggleActive(cat)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                cat.is_active
                  ? "bg-green-500/15 text-green-400"
                  : "bg-zinc-700 text-zinc-300"
              }`}
            >
              {cat.is_active ? "Visible" : "Hidden"}
            </button>
            <button
              onClick={() => {
                setError(null);
                setForm({
                  id: cat.id,
                  name: cat.name,
                  description: cat.description ?? "",
                  sort_order: String(cat.sort_order),
                  is_active: cat.is_active,
                });
              }}
              className="rounded-lg border border-zinc-700 p-2 text-zinc-300 transition-colors hover:border-[#ff6b1a] hover:text-white"
              aria-label={`Edit ${cat.name}`}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => remove(cat)}
              className="rounded-lg border border-zinc-700 p-2 text-zinc-300 transition-colors hover:border-red-500 hover:text-red-400"
              aria-label={`Delete ${cat.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="bg-zinc-900 px-4 py-8 text-center text-zinc-400">
            No categories yet.
          </p>
        )}
      </div>

      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <form
            onSubmit={save}
            className="w-full max-w-md space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6"
          >
            <h2 className="font-heading text-2xl tracking-wide text-white">
              {form.id === null ? "ADD" : "EDIT"}{" "}
              <span className="text-[#ff6b1a]">CATEGORY</span>
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
              <input
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className={inputCls}
              />
            </div>
            <div className="flex items-end gap-4">
              <div className="w-32">
                <label className={labelCls}>Sort order</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) =>
                    setForm({ ...form, sort_order: e.target.value })
                  }
                  className={inputCls}
                />
              </div>
              <label className="flex items-center gap-2 pb-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) =>
                    setForm({ ...form, is_active: e.target.checked })
                  }
                  className="h-4 w-4 accent-[#ff6b1a]"
                />
                Visible on menu
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
