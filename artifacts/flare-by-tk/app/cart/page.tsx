"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart";

const DELIVERY_FEE = 150;

function rs(value: number): string {
  return `Rs. ${Math.round(value).toLocaleString("en-PK")}`;
}

export default function CartPage() {
  const { items, setQty, clear, subtotal } = useCart();
  const router = useRouter();
  const [orderType, setOrderType] = useState<"delivery" | "pickup">("delivery");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [instructions, setInstructions] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deliveryFee = orderType === "delivery" ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  async function placeOrder() {
    setError(null);
    if (!name.trim()) return setError("Please enter your name.");
    if (!phone.trim()) return setError("Please enter your phone number.");
    if (orderType === "delivery" && !address.trim())
      return setError("Please enter your delivery address.");
    if (items.length === 0) return setError("Your cart is empty.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          customerAddress: orderType === "delivery" ? address : null,
          orderType,
          specialInstructions: instructions || null,
          items: items.map((i) => ({ id: i.id, qty: i.qty })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to place order");
      }
      clear();
      router.push(`/order/${data.trackingToken}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order");
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <ShoppingCart className="mx-auto h-12 w-12 text-zinc-600" />
        <h1 className="mt-4 font-heading text-4xl tracking-wide text-white">
          YOUR CART IS <span className="text-[#ff6b1a]">EMPTY</span>
        </h1>
        <p className="mt-2 text-zinc-400">
          Head over to the menu and add something delicious.
        </p>
        <Link
          href="/menu"
          className="mt-6 inline-block rounded-lg bg-[#ff6b1a] px-8 py-3 font-semibold text-black transition-colors hover:bg-[#e05a10]"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-heading text-5xl tracking-wide text-white">
        YOUR <span className="text-[#ff6b1a]">CART</span>
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4"
            >
              <div className="min-w-0">
                <h3 className="font-semibold text-white">{item.name}</h3>
                <p className="mt-0.5 text-sm text-zinc-400">
                  {rs(item.price)} each
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1">
                  <button
                    onClick={() => setQty(item.id, item.qty - 1)}
                    className="rounded p-1 text-zinc-300 hover:text-[#ff6b1a]"
                    aria-label={`Remove one ${item.name}`}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-5 text-center text-sm font-semibold text-white">
                    {item.qty}
                  </span>
                  <button
                    onClick={() => setQty(item.id, item.qty + 1)}
                    className="rounded p-1 text-zinc-300 hover:text-[#ff6b1a]"
                    aria-label={`Add one ${item.name}`}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="w-24 text-right font-semibold text-white">
                  {rs(item.price * item.qty)}
                </span>
                <button
                  onClick={() => setQty(item.id, 0)}
                  className="text-zinc-500 hover:text-red-400"
                  aria-label={`Remove ${item.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-lg font-semibold text-white">Checkout</h2>

          <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-zinc-800 p-1">
            {(["delivery", "pickup"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                className={`rounded-md py-2 text-sm font-semibold capitalize transition-colors ${
                  orderType === type
                    ? "bg-[#ff6b1a] text-black"
                    : "text-zinc-300 hover:text-white"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-[#ff6b1a]"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number (e.g. 0300 1234567)"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-[#ff6b1a]"
            />
            {orderType === "delivery" && (
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Delivery address"
                rows={2}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-[#ff6b1a]"
              />
            )}
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Special instructions (optional)"
              rows={2}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-[#ff6b1a]"
            />
          </div>

          <div className="mt-5 space-y-2 border-t border-zinc-800 pt-4 text-sm">
            <div className="flex justify-between text-zinc-400">
              <span>Subtotal</span>
              <span>{rs(subtotal)}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Delivery fee</span>
              <span>{orderType === "delivery" ? rs(DELIVERY_FEE) : "Free"}</span>
            </div>
            <div className="flex justify-between border-t border-zinc-800 pt-2 text-base font-bold text-white">
              <span>Total</span>
              <span className="text-[#ff6b1a]">{rs(total)}</span>
            </div>
          </div>

          {error && (
            <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            onClick={placeOrder}
            disabled={submitting}
            className="mt-4 w-full rounded-lg bg-[#ff6b1a] py-3 font-semibold text-black transition-colors hover:bg-[#e05a10] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Placing order…" : `Place Order — ${rs(total)}`}
          </button>
          <p className="mt-3 text-center text-xs text-zinc-500">
            Cash on delivery / pay at pickup
          </p>
        </div>
      </div>
    </div>
  );
}
