"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { rs } from "./types";

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
  special_instructions: string | null;
  items: OrderItem[];
  created_at: string;
}

const STATUSES = ["new", "preparing", "ready", "delivered", "cancelled"];

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500/15 text-blue-400",
  preparing: "bg-yellow-500/15 text-yellow-400",
  ready: "bg-green-500/15 text-green-400",
  delivered: "bg-zinc-500/15 text-zinc-400",
  cancelled: "bg-red-500/15 text-red-400",
};

const CURRENT_STATUSES = new Set(["new", "preparing", "ready"]);

type Filter = "current" | "past" | "all";

export default function OrdersTab({
  onUnauthorized,
}: {
  onUnauthorized: () => void;
}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<Filter>("current");

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
  }, [loadOrders]);

  async function updateStatus(id: number, status: string) {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o)),
      );
    }
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
