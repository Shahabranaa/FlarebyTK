"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, ShoppingCart, Menu as MenuIcon, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/deals", label: "Deals" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-[#0a0a0a]/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Flame className="h-7 w-7 text-[#ff6b1a]" />
          <span className="font-heading text-2xl tracking-wider text-white">
            FLARE <span className="text-[#ff6b1a]">BY TK</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-[#ff6b1a] ${
                pathname === link.href ? "text-[#ff6b1a]" : "text-zinc-300"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative rounded-full border border-zinc-800 bg-zinc-900 p-2.5 transition-colors hover:border-[#ff6b1a]"
          >
            <ShoppingCart className="h-5 w-5 text-zinc-100" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ff6b1a] px-1 text-xs font-bold text-black">
                {count}
              </span>
            )}
          </Link>
          <button
            className="rounded-md p-2 text-zinc-300 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-zinc-800 bg-[#0a0a0a] px-4 py-3 md:hidden">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`block py-2.5 text-sm font-medium ${
                pathname === link.href ? "text-[#ff6b1a]" : "text-zinc-300"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
