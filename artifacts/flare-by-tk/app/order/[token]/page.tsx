"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChefHat,
  CircleDashed,
  PackageCheck,
  Bike,
  XCircle,
} from "lucide-react";

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
  order_type: string;
  status: string;
  total_amount: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

const STEPS = [
  { key: "new", label: "Order Received", icon: CircleDashed },
  { key: "preparing", label: "Preparing", icon: ChefHat },
  { key: "ready", label: "Ready", icon: PackageCheck },
  { key: "delivered", label: "Delivered", icon: Bike },
];

function rs(value: string | number): string {
  return `Rs. ${Math.round(Number(value)).toLocaleString("en-PK")}`;
}

export default function OrderTrackingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/track/${token}`);
        if (res.status === 404) {
          if (!cancelled) setNotFound(true);
          return;
        }
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setOrder(data);
      } catch {
        // network hiccup — next poll will retry
      }
    }

    fetchOrder();
    const interval = setInterval(fetchOrder, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [token]);

  if (notFound) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <XCircle className="mx-auto h-12 w-12 text-zinc-600" />
        <h1 className="mt-4 font-heading text-4xl tracking-wide text-white">
          ORDER NOT <span className="text-[#ff6b1a]">FOUND</span>
        </h1>
        <p className="mt-2 text-zinc-400">
          We couldn&apos;t find an order with that tracking link.
        </p>
        <Link
          href="/menu"
          className="mt-6 inline-block rounded-lg bg-[#ff6b1a] px-8 py-3 font-semibold text-black hover:bg-[#e05a10]"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center text-zinc-400">
        Loading your order…
      </div>
    );
  }

  const cancelled = order.status === "cancelled";
  const currentIndex = STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-[#ff6b1a]" />
        <h1 className="mt-4 font-heading text-4xl tracking-wide text-white">
          THANK YOU, <span className="text-[#ff6b1a]">{order.customer_name.toUpperCase()}</span>
        </h1>
        <p className="mt-2 text-zinc-400">
          Order #{order.id} · {order.order_type === "delivery" ? "Delivery" : "Pickup"} ·
          placed {new Date(order.created_at).toLocaleString()}
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          This page updates automatically every few seconds.
        </p>
      </div>

      {cancelled ? (
        <div className="mt-10 rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <XCircle className="mx-auto h-8 w-8 text-red-400" />
          <p className="mt-2 font-semibold text-red-400">
            This order has been cancelled.
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            If this is unexpected, call us at +92 300 1234567.
          </p>
        </div>
      ) : (
        <div className="mt-10 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="space-y-6">
            {STEPS.map((step, index) => {
              const done = index < currentIndex;
              const active = index === currentIndex;
              const Icon = step.icon;
              return (
                <div key={step.key} className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      done || active
                        ? "border-[#ff6b1a] bg-[#ff6b1a]/15 text-[#ff6b1a]"
                        : "border-zinc-700 text-zinc-600"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p
                      className={`font-semibold ${
                        done || active ? "text-white" : "text-zinc-500"
                      }`}
                    >
                      {step.key === "delivered" && order.order_type === "pickup"
                        ? "Picked Up"
                        : step.label}
                    </p>
                    {active && (
                      <p className="text-xs text-[#ff6b1a]">In progress</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="font-semibold text-white">Order Summary</h2>
        <div className="mt-4 space-y-2 text-sm">
          {(order.items ?? []).map((item) => (
            <div key={item.id} className="flex justify-between text-zinc-300">
              <span>
                {item.qty} × {item.name}
              </span>
              <span>{rs(item.price * item.qty)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-zinc-800 pt-3 font-bold text-white">
            <span>Total {order.order_type === "delivery" ? "(incl. Rs. 150 delivery)" : ""}</span>
            <span className="text-[#ff6b1a]">{rs(order.total_amount)}</span>
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Save this page&apos;s link to check your order status anytime.
      </p>
    </div>
  );
}
