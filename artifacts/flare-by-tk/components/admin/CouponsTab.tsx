"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Tag, Trash2, X } from "lucide-react";
import {
  AdminCategory,
  AdminMenuItem,
  inputCls,
  labelCls,
  primaryBtn,
  rs,
  secondaryBtn,
} from "./types";

interface AdminCoupon {
  id: number;
  code: string;
  description: string | null;
  discount_type: "percent" | "fixed";
  discount_value: string;
  scope: "order" | "item" | "category";
  item_id: number | null;
  category_id: number | null;
  min_order_amount: string | null;
  starts_at: string | null;
  ends_at: string | null;
  days_of_week: number[];
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  item_name?: string | null;
  category_name?: string | null;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface FormState {
  code: string;
  description: string;
  discount_type: "percent" | "fixed";
  discount_value: string;
  scope: "order" | "item" | "category";
  item_id: string;
  category_id: string;
  min_order_amount: string;
  starts_at: string;
  ends_at: string;
  days_of_week: number[];
  max_uses: string;
  is_active: boolean;
}

const emptyForm: FormState = {
  code: "",
  description: "",
  discount_type: "percent",
  discount_value: "",
  scope: "order",
  item_id: "",
  category_id: "",
  min_order_amount: "",
  starts_at: "",
  ends_at: "",
  days_of_week: [],
  max_uses: "",
  is_active: true,
};

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function couponStatus(c: AdminCoupon): { label: string; cls: string } {
  const now = new Date();
  if (!c.is_active) return { label: "Off", cls: "bg-zinc-700 text-zinc-300" };
  if (c.max_uses !== null && c.used_count >= c.max_uses)
    return { label: "Used up", cls: "bg-red-500/15 text-red-400" };
  if (c.starts_at && now < new Date(c.starts_at))
    return { label: "Scheduled", cls: "bg-blue-500/15 text-blue-400" };
  if (c.ends_at && now > new Date(c.ends_at))
    return { label: "Expired", cls: "bg-red-500/15 text-red-400" };
  return { label: "Active", cls: "bg-green-500/15 text-green-400" };
}

function couponSummary(c: AdminCoupon): string {
  const amount =
    c.discount_type === "percent"
      ? `${Number(c.discount_value)}% off`
      : `${rs(c.discount_value)} off`;
  const target =
    c.scope === "item"
      ? c.item_name
        ? ` ${c.item_name}`
        : " a specific item"
      : c.scope === "category"
        ? c.category_name
          ? ` ${c.category_name}`
          : " a specific category"
        : "";
  const parts = [amount + target];
  if (c.min_order_amount) parts.push(`min order ${rs(c.min_order_amount)}`);
  if (c.days_of_week.length > 0 && c.days_of_week.length < 7)
    parts.push(c.days_of_week.map((d) => DAY_LABELS[d]).join("/"));
  if (c.starts_at)
    parts.push(`from ${new Date(c.starts_at).toLocaleString()}`);
  if (c.ends_at) parts.push(`until ${new Date(c.ends_at).toLocaleString()}`);
  if (c.max_uses !== null) parts.push(`${c.used_count}/${c.max_uses} used`);
  else if (c.used_count > 0) parts.push(`${c.used_count} used`);
  return parts.join(" · ");
}

export default function CouponsTab({
  onUnauthorized,
}: {
  onUnauthorized: () => void;
}) {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [items, setItems] = useState<AdminMenuItem[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [cRes, iRes, catRes] = await Promise.all([
        fetch("/api/coupons"),
        fetch("/api/menu-items?all=true"),
        fetch("/api/categories?all=true"),
      ]);
      if (cRes.status === 401) return onUnauthorized();
      setCoupons(await cRes.json());
      if (iRes.ok) setItems(await iRes.json());
      if (catRes.ok) setCategories(await catRes.json());
    } finally {
      setLoading(false);
    }
  }, [onUnauthorized]);

  useEffect(() => {
    load();
  }, [load]);

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setShowForm(true);
  }

  function startEdit(c: AdminCoupon) {
    setEditingId(c.id);
    setForm({
      code: c.code,
      description: c.description ?? "",
      discount_type: c.discount_type,
      discount_value: String(Number(c.discount_value)),
      scope: c.scope,
      item_id: c.item_id ? String(c.item_id) : "",
      category_id: c.category_id ? String(c.category_id) : "",
      min_order_amount: c.min_order_amount
        ? String(Number(c.min_order_amount))
        : "",
      starts_at: toLocalInput(c.starts_at),
      ends_at: toLocalInput(c.ends_at),
      days_of_week: c.days_of_week ?? [],
      max_uses: c.max_uses !== null ? String(c.max_uses) : "",
      is_active: c.is_active,
    });
    setError(null);
    setShowForm(true);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        code: form.code,
        description: form.description || null,
        discount_type: form.discount_type,
        discount_value: form.discount_value,
        scope: form.scope,
        item_id: form.scope === "item" ? form.item_id : null,
        category_id: form.scope === "category" ? form.category_id : null,
        min_order_amount: form.min_order_amount || null,
        starts_at: form.starts_at
          ? new Date(form.starts_at).toISOString()
          : null,
        ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
        days_of_week: form.days_of_week,
        max_uses: form.max_uses || null,
        is_active: form.is_active,
      };
      const res = await fetch(
        editingId ? `/api/coupons/${editingId}` : "/api/coupons",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (res.status === 401) return onUnauthorized();
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to save coupon");
        return;
      }
      setShowForm(false);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(c: AdminCoupon) {
    const res = await fetch(`/api/coupons/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !c.is_active }),
    });
    if (res.status === 401) return onUnauthorized();
    if (res.ok) {
      const updated = await res.json();
      setCoupons((prev) =>
        prev.map((x) => (x.id === c.id ? { ...x, ...updated } : x)),
      );
    }
  }

  async function remove(c: AdminCoupon) {
    if (!confirm(`Delete coupon ${c.code}? This cannot be undone.`)) return;
    const res = await fetch(`/api/coupons/${c.id}`, { method: "DELETE" });
    if (res.status === 401) return onUnauthorized();
    if (res.ok) setCoupons((prev) => prev.filter((x) => x.id !== c.id));
  }

  function toggleDay(d: number) {
    setForm((f) => ({
      ...f,
      days_of_week: f.days_of_week.includes(d)
        ? f.days_of_week.filter((x) => x !== d)
        : [...f.days_of_week, d].sort(),
    }));
  }

  if (loading) {
    return <p className="py-12 text-center text-zinc-400">Loading coupons…</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">
          {coupons.length} coupon{coupons.length === 1 ? "" : "s"}
        </p>
        <button onClick={startCreate} className={primaryBtn}>
          <span className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> New Coupon
          </span>
        </button>
      </div>

      {showForm && (
        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">
              {editingId ? "Edit Coupon" : "New Coupon"}
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-zinc-400 hover:text-white"
              aria-label="Close form"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Code</label>
              <input
                value={form.code}
                onChange={(e) =>
                  setForm({ ...form, code: e.target.value.toUpperCase() })
                }
                placeholder="e.g. FLARE20"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Description (optional)</label>
              <input
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="e.g. 20% off weekend deal"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Discount type</label>
              <select
                value={form.discount_type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    discount_type: e.target.value as "percent" | "fixed",
                  })
                }
                className={inputCls}
              >
                <option value="percent">Percent (%)</option>
                <option value="fixed">Fixed amount (Rs.)</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>
                {form.discount_type === "percent"
                  ? "Percent off"
                  : "Amount off (Rs.)"}
              </label>
              <input
                type="number"
                min={1}
                value={form.discount_value}
                onChange={(e) =>
                  setForm({ ...form, discount_value: e.target.value })
                }
                placeholder={form.discount_type === "percent" ? "20" : "200"}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Applies to</label>
              <select
                value={form.scope}
                onChange={(e) =>
                  setForm({
                    ...form,
                    scope: e.target.value as FormState["scope"],
                  })
                }
                className={inputCls}
              >
                <option value="order">Whole order</option>
                <option value="item">A specific item</option>
                <option value="category">A specific category</option>
              </select>
            </div>
            {form.scope === "item" && (
              <div>
                <label className={labelCls}>Item</label>
                <select
                  value={form.item_id}
                  onChange={(e) => setForm({ ...form, item_id: e.target.value })}
                  className={inputCls}
                >
                  <option value="">Select an item…</option>
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({rs(i.price)})
                    </option>
                  ))}
                </select>
              </div>
            )}
            {form.scope === "category" && (
              <div>
                <label className={labelCls}>Category</label>
                <select
                  value={form.category_id}
                  onChange={(e) =>
                    setForm({ ...form, category_id: e.target.value })
                  }
                  className={inputCls}
                >
                  <option value="">Select a category…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className={labelCls}>Minimum order (Rs., optional)</label>
              <input
                type="number"
                min={0}
                value={form.min_order_amount}
                onChange={(e) =>
                  setForm({ ...form, min_order_amount: e.target.value })
                }
                placeholder="e.g. 1000"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Usage limit (optional)</label>
              <input
                type="number"
                min={1}
                value={form.max_uses}
                onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                placeholder="e.g. 100 orders"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Starts (optional)</label>
              <input
                type="datetime-local"
                value={form.starts_at}
                onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Ends (optional)</label>
              <input
                type="datetime-local"
                value={form.ends_at}
                onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
                className={inputCls}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>
                Valid days (leave empty for every day)
              </label>
              <div className="flex flex-wrap gap-2">
                {DAY_LABELS.map((label, d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors ${
                      form.days_of_week.includes(d)
                        ? "border-[#ff6b1a] bg-[#ff6b1a]/15 text-[#ff6b1a]"
                        : "border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-500"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) =>
                  setForm({ ...form, is_active: e.target.checked })
                }
                className="h-4 w-4 accent-[#ff6b1a]"
              />
              Active
            </label>
          </div>

          {error && (
            <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="mt-4 flex gap-2">
            <button onClick={save} disabled={saving} className={primaryBtn}>
              {saving ? "Saving…" : editingId ? "Save Changes" : "Create Coupon"}
            </button>
            <button onClick={() => setShowForm(false)} className={secondaryBtn}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 space-y-3">
        {coupons.length === 0 && !showForm && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center text-zinc-400">
            <Tag className="mx-auto h-8 w-8 text-zinc-600" />
            <p className="mt-3">
              No coupons yet. Create one to announce a promotion.
            </p>
          </div>
        )}
        {coupons.map((c) => {
          const status = couponStatus(c);
          return (
            <div
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-base font-bold tracking-wide text-white">
                    {c.code}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${status.cls}`}
                  >
                    {status.label}
                  </span>
                </div>
                {c.description && (
                  <p className="mt-0.5 text-sm text-zinc-400">{c.description}</p>
                )}
                <p className="mt-1 text-xs text-zinc-500">{couponSummary(c)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActive(c)}
                  className={secondaryBtn}
                  title={c.is_active ? "Turn off" : "Turn on"}
                >
                  {c.is_active ? "Turn Off" : "Turn On"}
                </button>
                <button
                  onClick={() => startEdit(c)}
                  className="rounded-lg border border-zinc-700 p-2 text-zinc-300 transition-colors hover:border-[#ff6b1a] hover:text-[#ff6b1a]"
                  aria-label={`Edit ${c.code}`}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => remove(c)}
                  className="rounded-lg border border-zinc-700 p-2 text-zinc-300 transition-colors hover:border-red-500 hover:text-red-400"
                  aria-label={`Delete ${c.code}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
