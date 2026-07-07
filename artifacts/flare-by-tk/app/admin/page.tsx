"use client";

import { useCallback, useEffect, useState } from "react";
import { Lock, RefreshCw, Shield } from "lucide-react";

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

function rs(value: string | number): string {
  return `Rs. ${Math.round(Number(value)).toLocaleString("en-PK")}`;
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      if (res.ok) {
        setOrders(await res.json());
        setAuthed(true);
      }
    } finally {
      setLoading(false);
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setLoginError(data?.error || "Login failed");
      return;
    }
    setPassword("");
    await loadOrders();
  }

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

  if (checking) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center text-zinc-400">
        Loading…
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="mx-auto max-w-sm px-4 py-24">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <Lock className="mx-auto h-8 w-8 text-[#ff6b1a]" />
          <h1 className="mt-4 font-heading text-3xl tracking-wide text-white">
            ADMIN <span className="text-[#ff6b1a]">LOGIN</span>
          </h1>
          <form onSubmit={login} className="mt-6 space-y-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-[#ff6b1a]"
            />
            {loginError && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {loginError}
              </p>
            )}
            <button
              type="submit"
              className="w-full rounded-lg bg-[#ff6b1a] py-2.5 font-semibold text-black transition-colors hover:bg-[#e05a10]"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="flex items-center gap-3 font-heading text-4xl tracking-wide text-white">
          <Shield className="h-8 w-8 text-[#ff6b1a]" />
          ORDER <span className="text-[#ff6b1a]">DASHBOARD</span>
        </h1>
        <button
          onClick={loadOrders}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-[#ff6b1a] disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <p className="mt-12 text-center text-zinc-400">No orders yet.</p>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
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
