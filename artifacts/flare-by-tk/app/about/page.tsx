import type { Metadata } from "next";
import { Flame, MapPin, Phone, Clock, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "About — Flare by TK",
  description:
    "The story of Flare by TK — Bahawalpur's fast-casual spot for flame-grilled goodness in Satellite Town.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <div className="text-center">
        <Flame className="mx-auto h-10 w-10 text-[#ff6b1a]" />
        <h1 className="mt-4 font-heading text-5xl tracking-wide text-white">
          ABOUT <span className="text-[#ff6b1a]">FLARE BY TK</span>
        </h1>
      </div>

      <div className="mt-10 space-y-6 text-lg leading-relaxed text-zinc-300">
        <p>
          Flare by TK started with a simple idea: Bahawalpur deserves food
          that&apos;s fast without cutting corners. Every burger is smashed to
          order, every pizza is hand-tossed, and our BBQ comes off real
          charcoal — the way it should.
        </p>
        <p>
          From our kitchen in Satellite Town, we serve a menu that brings
          together the best of both worlds — juicy flame-grilled burgers and
          crispy zingers alongside desi classics like chicken biryani, seekh
          kebabs and karahi. Whether you&apos;re grabbing a quick roll or
          ordering a family feast, everything is made fresh when you order it.
        </p>
        <p>
          We keep it simple: quality ingredients, honest portions, and flavors
          that hit every single time.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <MapPin className="h-6 w-6 text-[#ff6b1a]" />
          <h2 className="mt-3 font-semibold text-white">Find Us</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Satellite Town, Bahawalpur, Punjab, Pakistan
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <Clock className="h-6 w-6 text-[#ff6b1a]" />
          <h2 className="mt-3 font-semibold text-white">Opening Hours</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Daily 12:00 PM – 12:00 AM
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <Phone className="h-6 w-6 text-[#ff6b1a]" />
          <h2 className="mt-3 font-semibold text-white">Call to Order</h2>
          <p className="mt-1 text-sm text-zinc-400">+92 300 1234567</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <Heart className="h-6 w-6 text-[#ff6b1a]" />
          <h2 className="mt-3 font-semibold text-white">Made with Care</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Fresh ingredients, halal-certified, prepared daily.
          </p>
        </div>
      </div>
    </div>
  );
}
