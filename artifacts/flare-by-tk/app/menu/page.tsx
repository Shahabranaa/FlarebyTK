import type { Metadata } from "next";
import MenuSection from "@/components/MenuSection";

export const metadata: Metadata = {
  title: "Menu — Flare by TK",
  description:
    "Browse the full Flare by TK menu: burgers, pizzas, BBQ, rolls, desi specials, desserts and more.",
};

export default function MenuPage() {
  return (
    <div className="pt-10">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <h1 className="font-heading text-5xl tracking-wide text-white">
          OUR <span className="text-[#ff6b1a]">MENU</span>
        </h1>
        <p className="mt-2 text-zinc-400">
          Everything is made to order. Prices include tax.
        </p>
      </div>
      <div className="mt-6">
        <MenuSection />
      </div>
    </div>
  );
}
