import Link from "next/link";
import { Flame, Clock, Bike } from "lucide-react";
import MenuSection from "@/components/MenuSection";
import { HERO_IMAGE } from "@/lib/seed";

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-[#0a0a0a]" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 py-24 text-center md:py-32">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#ff6b1a]/40 bg-[#ff6b1a]/10 px-4 py-1.5 text-sm font-medium text-[#ff6b1a]">
            <Flame className="h-4 w-4" /> Now serving in Bahawalpur
          </span>
          <h1 className="mt-6 font-heading text-6xl tracking-wide text-white md:text-8xl">
            FLARE <span className="text-[#ff6b1a]">BY TK.</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-zinc-300">
            Flame-grilled burgers, hand-tossed pizzas, charcoal BBQ and desi
            favorites — made fresh, served fast.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#menu"
              className="rounded-lg bg-[#ff6b1a] px-8 py-3 font-semibold text-black transition-colors hover:bg-[#e05a10]"
            >
              Order Now
            </a>
            <Link
              href="/deals"
              className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-8 py-3 font-semibold text-white transition-colors hover:border-[#ff6b1a]"
            >
              View Deals
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-400">
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#ff6b1a]" /> Open daily 12 PM – 12
              AM
            </span>
            <span className="flex items-center gap-2">
              <Bike className="h-4 w-4 text-[#ff6b1a]" /> Delivery across
              Bahawalpur — Rs. 150
            </span>
          </div>
        </div>
      </section>

      <MenuSection />
    </>
  );
}
