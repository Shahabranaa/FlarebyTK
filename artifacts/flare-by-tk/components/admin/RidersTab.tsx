"use client";

import { useCallback, useEffect, useState } from "react";
import { Bike, Pencil, Plus, Trash2, X } from "lucide-react";
import { inputCls, labelCls, primaryBtn, secondaryBtn } from "./types";

export interface Rider {
  id: number;
  name: string;
  phone: string;
  is_active: boolean;
}

export default function RidersTab({
  onUnauthorized,
}: {
  onUnauthorized: () => void;
}) {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/riders");
      if (res.status === 401) return onUnauthorized();
      if (res.ok) setRiders(await res.json());
    } finally {
      setLoading(false);
    }
  }, [onUnauthorized]);

  useEffect(() => {
    load();
  }, [load]);

  function startCreate() {
    setEditingId(null);
    setName("");
    setPhone("");
    setError(null);
    setShowForm(true);
  }

  function startEdit(r: Rider) {
    setEditingId(r.id);
    setName(r.name);
    setPhone(r.phone);
    setError(null);
    setShowForm(true);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(
        editingId ? `/api/riders/${editingId}` : "/api/riders",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, phone }),
        },
      );
      if (res.status === 401) return onUnauthorized();
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to save rider");
        return;
      }
      setShowForm(false);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(r: Rider) {
    const res = await fetch(`/api/riders/${r.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !r.is_active }),
    });
    if (res.status === 401) return onUnauthorized();
    if (res.ok) {
      setRiders((prev) =>
        prev.map((x) =>
          x.id === r.id ? { ...x, is_active: !r.is_active } : x,
        ),
      );
    }
  }

  async function remove(r: Rider) {
    if (!confirm(`Delete rider ${r.name}?`)) return;
    const res = await fetch(`/api/riders/${r.id}`, { method: "DELETE" });
    if (res.status === 401) return onUnauthorized();
    if (res.ok) setRiders((prev) => prev.filter((x) => x.id !== r.id));
  }

  if (loading) {
    return <p className="py-12 text-center text-zinc-400">Loading riders…</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">
          {riders.length} rider{riders.length === 1 ? "" : "s"}
        </p>
        <button onClick={startCreate} className={primaryBtn}>
          <span className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Rider
          </span>
        </button>
      </div>

      {showForm && (
        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">
              {editingId ? "Edit Rider" : "Add Rider"}
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
              <label className={labelCls}>Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rider name"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0300 1234567"
                className={inputCls}
              />
            </div>
          </div>
          {error && (
            <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}
          <div className="mt-4 flex gap-2">
            <button onClick={save} disabled={saving} className={primaryBtn}>
              {saving ? "Saving…" : editingId ? "Save Changes" : "Add Rider"}
            </button>
            <button onClick={() => setShowForm(false)} className={secondaryBtn}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 space-y-3">
        {riders.length === 0 && !showForm && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center text-zinc-400">
            <Bike className="mx-auto h-8 w-8 text-zinc-600" />
            <p className="mt-3">
              No riders yet. Add your delivery riders so you can assign them to
              orders.
            </p>
          </div>
        )}
        {riders.map((r) => (
          <div
            key={r.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">{r.name}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    r.is_active
                      ? "bg-green-500/15 text-green-400"
                      : "bg-zinc-700 text-zinc-300"
                  }`}
                >
                  {r.is_active ? "Active" : "Off"}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-zinc-400">{r.phone}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toggleActive(r)} className={secondaryBtn}>
                {r.is_active ? "Turn Off" : "Turn On"}
              </button>
              <button
                onClick={() => startEdit(r)}
                className="rounded-lg border border-zinc-700 p-2 text-zinc-300 transition-colors hover:border-[#ff6b1a] hover:text-[#ff6b1a]"
                aria-label={`Edit ${r.name}`}
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => remove(r)}
                className="rounded-lg border border-zinc-700 p-2 text-zinc-300 transition-colors hover:border-red-500 hover:text-red-400"
                aria-label={`Delete ${r.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
