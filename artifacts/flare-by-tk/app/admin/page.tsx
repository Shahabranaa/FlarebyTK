"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ClipboardList,
  Lock,
  Shield,
  Tag,
  Tags,
  UtensilsCrossed,
} from "lucide-react";
import OrdersTab from "@/components/admin/OrdersTab";
import MenuTab from "@/components/admin/MenuTab";
import CategoriesTab from "@/components/admin/CategoriesTab";
import CouponsTab from "@/components/admin/CouponsTab";

type Tab = "orders" | "menu" | "categories" | "coupons";

const TABS: { key: Tab; label: string; icon: typeof ClipboardList }[] = [
  { key: "orders", label: "Orders", icon: ClipboardList },
  { key: "menu", label: "Menu Items", icon: UtensilsCrossed },
  { key: "categories", label: "Categories", icon: Tags },
  { key: "coupons", label: "Coupons", icon: Tag },
];

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("orders");
  const [menuRefreshKey, setMenuRefreshKey] = useState(0);

  const onUnauthorized = useCallback(() => setAuthed(false), []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/orders");
        setAuthed(res.ok);
      } finally {
        setChecking(false);
      }
    })();
  }, []);

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
    setAuthed(true);
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
      <h1 className="flex items-center gap-3 font-heading text-4xl tracking-wide text-white">
        <Shield className="h-8 w-8 text-[#ff6b1a]" />
        ADMIN <span className="text-[#ff6b1a]">DASHBOARD</span>
      </h1>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-zinc-800 pb-px">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
              tab === key
                ? "border-[#ff6b1a] text-[#ff6b1a]"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "orders" && <OrdersTab onUnauthorized={onUnauthorized} />}
        {tab === "menu" && (
          <MenuTab refreshKey={menuRefreshKey} onUnauthorized={onUnauthorized} />
        )}
        {tab === "categories" && (
          <CategoriesTab
            onUnauthorized={onUnauthorized}
            onChanged={() => setMenuRefreshKey((k) => k + 1)}
          />
        )}
        {tab === "coupons" && <CouponsTab onUnauthorized={onUnauthorized} />}
      </div>
    </div>
  );
}
