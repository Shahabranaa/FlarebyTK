import Link from "next/link";
import { Flame, MapPin, Phone, Clock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-[#ff6b1a]" />
            <span className="font-heading text-xl tracking-wider text-white">
              FLARE <span className="text-[#ff6b1a]">BY TK</span>
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Bahawalpur&apos;s home of flame-grilled burgers, hand-tossed pizzas
            and charcoal BBQ. Fast, fresh and full of flavor.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">
            Visit Us
          </h3>
          <ul className="mt-3 space-y-2.5 text-sm text-zinc-400">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#ff6b1a]" />
              Satellite Town, Bahawalpur, Punjab, Pakistan
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-[#ff6b1a]" />
              +92 300 1234567
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#ff6b1a]" />
              Daily 12:00 PM – 12:00 AM
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">
            Quick Links
          </h3>
          <ul className="mt-3 space-y-2.5 text-sm text-zinc-400">
            <li>
              <Link href="/menu" className="hover:text-[#ff6b1a]">
                Full Menu
              </Link>
            </li>
            <li>
              <Link href="/deals" className="hover:text-[#ff6b1a]">
                Today&apos;s Deals
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-[#ff6b1a]">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-[#ff6b1a]">
                Your Cart
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-zinc-800 py-4 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} Flare by TK. All rights reserved.
      </div>
    </footer>
  );
}
