"use client";

import { useCallback, useEffect, useState } from "react";
import { labelCls, primaryBtn } from "./types";
import { TEMPLATE_KEYS, TEMPLATE_PLACEHOLDERS } from "@/lib/whatsapp";

const textareaCls =
  "w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 font-mono text-sm text-white placeholder-zinc-500 outline-none focus:border-[#ff6b1a]";

export default function SettingsTab({
  onUnauthorized,
}: {
  onUnauthorized: () => void;
}) {
  const [confirmTpl, setConfirmTpl] = useState("");
  const [onTheWayTpl, setOnTheWayTpl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.status === 401) return onUnauthorized();
      if (res.ok) {
        const data = await res.json();
        setConfirmTpl(data[TEMPLATE_KEYS.confirm] ?? "");
        setOnTheWayTpl(data[TEMPLATE_KEYS.onTheWay] ?? "");
      }
    } finally {
      setLoading(false);
    }
  }, [onUnauthorized]);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [TEMPLATE_KEYS.confirm]: confirmTpl,
          [TEMPLATE_KEYS.onTheWay]: onTheWayTpl,
        }),
      });
      if (res.status === 401) return onUnauthorized();
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || "Failed to save");
        return;
      }
      setMessage("Saved! New messages will use these templates.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="py-12 text-center text-zinc-400">Loading settings…</p>;
  }

  return (
    <div className="max-w-3xl">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h3 className="font-semibold text-white">WhatsApp Message Templates</h3>
        <p className="mt-1 text-sm text-zinc-400">
          These are the messages sent to customers from the Orders tab. You can
          use these placeholders — they get replaced automatically:
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {TEMPLATE_PLACEHOLDERS.map((p) => (
            <code
              key={p}
              className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-[#ff6b1a]"
            >
              {p}
            </code>
          ))}
        </div>

        <div className="mt-5">
          <label className={labelCls}>
            Order confirmed message (sent after entering the POS number)
          </label>
          <textarea
            value={confirmTpl}
            onChange={(e) => setConfirmTpl(e.target.value)}
            rows={9}
            className={textareaCls}
          />
        </div>

        <div className="mt-4">
          <label className={labelCls}>
            On-its-way message (sent after assigning a rider — put your bank
            details here)
          </label>
          <textarea
            value={onTheWayTpl}
            onChange={(e) => setOnTheWayTpl(e.target.value)}
            rows={11}
            className={textareaCls}
          />
        </div>

        {message && (
          <p className="mt-3 rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-400">
            {message}
          </p>
        )}
        {error && (
          <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          onClick={save}
          disabled={saving}
          className={`mt-4 ${primaryBtn}`}
        >
          {saving ? "Saving…" : "Save Templates"}
        </button>
      </div>
    </div>
  );
}
