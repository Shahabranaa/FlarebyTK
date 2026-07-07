"use client";

import { useCallback, useEffect, useState } from "react";
import { Bike, Check, MessageCircle, RefreshCw } from "lucide-react";
import { rs } from "./types";
import { fillTemplate, waLink, TEMPLATE_KEYS } from "@/lib/whatsapp";
import type { Rider } from "./RidersTab";

interface OrderItem {
  id: number;
  name: string;
  price: number;
  qty: number;
}

interface Order {
  id: number;
  tracking_token: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string | null;
  order_type: string;
  status: string;
  total_amount: string;
  coupon_code: string | null;
  discount_amount: string | null;
  special_instructions: string | null;
  pos_number: string | null;
  rider_id: number | null;
  rider_name: string | null;
  rider_phone: string | null;
  items: OrderItem[];
  created_at: string;
}

function buildMessage(template: string, order: Order): string {
  const itemsText = (order.items ?? [])
    .map((i) => `${i.qty} × ${i.name} — ${rs(i.price * i.qty)}`)
    .join("\n");
  return fillTemplate(template, {
    customer_name: order.customer_name,
    order_no: order.pos_number || String(order.id),
    items: itemsText,
    total: rs(order.total_amount),
    rider_name: order.rider_name ?? "",
    rider_phone: order.rider_phone ?? "",
  });
}

const STATUSES = [
  "new",
  "accepted",
  "preparing",
  "ready",
  "delivered",
  "cancelled",
];

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500/15 text-blue-400",
  accepted: "bg-purple-500/15 text-purple-400",
  preparing: "bg-yellow-500/15 text-yellow-400",
  ready: "bg-green-500/15 text-green-400",
  delivered: "bg-zinc-500/15 text-zinc-400",
  cancelled: "bg-red-500/15 text-red-400",
};

const CURRENT_STATUSES = new Set(["new", "accepted", "preparing", "ready"]);

type Filter = "current" | "past" | "all";

export default function OrdersTab({
  onUnauthorized,
}: {
  onUnauthorized: () => void;
}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<Filter>("current");
  const [riders, setRiders] = useState<Rider[]>([]);
  const [templates, setTemplates] = useState<Record<string, string>>({});
  const [posDrafts, setPosDrafts] = useState<Record<number, string>>({});

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      if (res.status === 401) {
        onUnauthorized();
        return;
      }
      if (res.ok) setOrders(await res.json());
    } finally {
      setLoading(false);
    }
  }, [onUnauthorized]);

  useEffect(() => {
    loadOrders();
    (async () => {
      const [rRes, sRes] = await Promise.all([
        fetch("/api/riders"),
        fetch("/api/settings"),
      ]);
      if (rRes.status === 401 || sRes.status === 401) {
        onUnauthorized();
        return;
      }
      if (rRes.ok) setRiders(await rRes.json());
      if (sRes.ok) setTemplates(await sRes.json());
    })();
  }, [loadOrders]);

  async function patchOrder(id: number, patch: Record<string, unknown>) {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.status === 401) return onUnauthorized();
    if (res.ok) {
      const updated = await res.json();
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== id) return o;
          const rider =
            "rider_id" in patch
              ? riders.find((r) => r.id === updated.rider_id)
              : null;
          return {
            ...o,
            ...("status" in patch ? { status: updated.status } : {}),
            ...("pos_number" in patch
              ? { pos_number: updated.pos_number }
              : {}),
            ...("rider_id" in patch
              ? {
                  rider_id: updated.rider_id,
                  rider_name: rider?.name ?? null,
                  rider_phone: rider?.phone ?? null,
                }
              : {}),
          };
        }),
      );
    }
  }

  function updateStatus(id: number, status: string) {
    return patchOrder(id, { status });
  }

  const filtered = orders.filter((o) =>
    filter === "all"
      ? true
      : filter === "current"
        ? CURRENT_STATUSES.has(o.status)
        : !CURRENT_STATUSES.has(o.status),
  );

  const counts = {
    current: orders.filter((o) => CURRENT_STATUSES.has(o.status)).length,
    past: orders.filter((o) => !CURRENT_STATUSES.has(o.status)).length,
    all: orders.length,
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(
            [
              ["current", "Current"],
              ["past", "Past"],
              ["all", "All"],
            ] as [Filter, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                filter === key
                  ? "bg-[#ff6b1a] text-black"
                  : "border border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-[#ff6b1a]"
              }`}
            >
              {label} ({counts[key]})
            </button>
          ))}
        </div>
        <button
          onClick={loadOrders}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-[#ff6b1a] disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-12 text-center text-zinc-400">
          {filter === "current"
            ? "No current orders."
            : filter === "past"
              ? "No past orders."
              : "No orders yet."}
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {filtered.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-semibold text-white">
                      Order #{order.id}
                    </h2>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_COLORS[order.status] ?? "bg-zinc-500/15 text-zinc-400"}`}
                    >
                      {order.status}
                    </span>
                    <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs capitalize text-zinc-300">
                      {order.order_type}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-400">
                    {order.customer_name} · {order.customer_phone}
                    {order.customer_address ? ` · ${order.customer_address}` : ""}
                  </p>
                  {order.special_instructions && (
                    <p className="mt-1 text-sm italic text-zinc-500">
                      “{order.special_instructions}”
                    </p>
                  )}
                  <p className="mt-1 text-xs text-zinc-500">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[#ff6b1a]">
                    {rs(order.total_amount)}
                  </p>
                  {order.coupon_code && Number(order.discount_amount) > 0 && (
                    <p className="text-xs font-semibold text-green-400">
                      {order.coupon_code} · -{rs(order.discount_amount ?? 0)}
                    </p>
                  )}
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="mt-2 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm capitalize text-white outline-none focus:border-[#ff6b1a]"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s} className="capitalize">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-3 border-t border-zinc-800 pt-3 text-sm text-zinc-300">
                {(order.items ?? [])
                  .map((i) => `${i.qty} × ${i.name}`)
                  .join(" · ")}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-zinc-800 pt-3">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor={`pos-${order.id}`}
                    className="text-xs font-semibold uppercase tracking-wide text-zinc-500"
                  >
                    POS #
                  </label>
                  <input
                    id={`pos-${order.id}`}
                    value={posDrafts[order.id] ?? order.pos_number ?? ""}
                    onChange={(e) =>
                      setPosDrafts((prev) => ({
                        ...prev,
                        [order.id]: e.target.value,
                      }))
                    }
                    placeholder="e.g. 12345"
                    className="w-28 rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-[#ff6b1a]"
                  />
                  {(posDrafts[order.id] ?? order.pos_number ?? "") !==
                    (order.pos_number ?? "") && (
                    <button
                      onClick={() =>
                        patchOrder(order.id, {
                          pos_number: posDrafts[order.id] ?? "",
                        })
                      }
                      className="flex items-center gap-1 rounded-lg bg-[#ff6b1a] px-2.5 py-1.5 text-xs font-semibold text-black"
                    >
                      <Check className="h-3.5 w-3.5" /> Save
                    </button>
                  )}
                </div>

                {order.order_type === "delivery" && (
                  <div className="flex items-center gap-2">
                    <Bike className="h-4 w-4 text-zinc-500" />
                    <select
                      value={order.rider_id ?? ""}
                      onChange={(e) =>
                        patchOrder(order.id, {
                          rider_id: e.target.value
                            ? Number(e.target.value)
                            : null,
                        })
                      }
                      className="rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-sm text-white outline-none focus:border-[#ff6b1a]"
                    >
                      <option value="">No rider</option>
                      {riders
                        .filter((r) => r.is_active || r.id === order.rider_id)
                        .map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                <div className="ml-auto flex flex-wrap gap-2">
                  <a
                    href={
                      order.pos_number
                        ? waLink(
                            order.customer_phone,
                            buildMessage(
                              templates[TEMPLATE_KEYS.confirm] ?? "",
                              order,
                            ),
                          )
                        : undefined
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-disabled={!order.pos_number}
                    title={
                      order.pos_number
                        ? "Open WhatsApp with the confirmation message"
                        : "Enter and save the POS # first"
                    }
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      order.pos_number
                        ? "bg-green-600 text-white hover:bg-green-500"
                        : "pointer-events-none cursor-not-allowed bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> Send Confirmation
                  </a>
                  {order.order_type === "delivery" && (
                    <a
                      href={
                        order.pos_number && order.rider_id
                          ? waLink(
                              order.customer_phone,
                              buildMessage(
                                templates[TEMPLATE_KEYS.onTheWay] ?? "",
                                order,
                              ),
                            )
                          : undefined
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-disabled={!order.pos_number || !order.rider_id}
                      title={
                        order.pos_number && order.rider_id
                          ? "Open WhatsApp with the on-its-way message"
                          : "Save the POS # and assign a rider first"
                      }
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                        order.pos_number && order.rider_id
                          ? "bg-green-600 text-white hover:bg-green-500"
                          : "pointer-events-none cursor-not-allowed bg-zinc-800 text-zinc-500"
                      }`}
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> Send On Its Way
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
