import type { Metadata } from "next";
import Link from "next/link";
import { Tag } from "lucide-react";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Deals — Flare by TK",
  description:
    "Today's best deals at Flare by TK — combos, family feasts and more at unbeatable prices.",
};

interface Deal {
  id: number;
  title: string;
  description: string | null;
  image_url: string | null;
  original_price: string | null;
  deal_price: string;
  discount_type: string | null;
  discount_value: string | null;
}

function rs(value: string | number): string {
  return `Rs. ${Math.round(Number(value)).toLocaleString("en-PK")}`;
}

export default async function DealsPage() {
  let deals: Deal[] = [];
  let failed = false;
  try {
    deals = await sql<Deal>(
      `SELECT id, title, description, image_url, original_price, deal_price,
              discount_type, discount_value
       FROM deals
       WHERE is_active = TRUE
       ORDER BY id ASC`,
    );
  } catch (err) {
    console.error("DealsPage query failed", err);
    failed = true;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="text-center">
        <h1 className="font-heading text-5xl tracking-wide text-white">
          TODAY&apos;S <span className="text-[#ff6b1a]">DEALS</span>
        </h1>
        <p className="mt-2 text-zinc-400">
          Big flavor, smaller bills. Grab them while they&apos;re hot.
        </p>
      </div>

      {failed ? (
        <p className="mt-12 text-center text-zinc-400">
          Couldn&apos;t load deals right now. Please refresh the page.
        </p>
      ) : deals.length === 0 ? (
        <p className="mt-12 text-center text-zinc-400">
          No active deals at the moment — check back soon!
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {deals.map((deal) => {
            const savings =
              deal.original_price != null
                ? Number(deal.original_price) - Number(deal.deal_price)
                : null;
            return (
              <div
                key={deal.id}
                className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900"
              >
                {deal.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={deal.image_url}
                    alt={deal.title}
                    className="h-44 w-full object-cover"
                  />
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-[#ff6b1a]" />
                    <h2 className="text-lg font-semibold text-white">
                      {deal.title}
                    </h2>
                  </div>
                  {deal.description && (
                    <p className="mt-2 text-sm text-zinc-400">
                      {deal.description}
                    </p>
                  )}
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <div className="text-2xl font-bold text-[#ff6b1a]">
                        {rs(deal.deal_price)}
                      </div>
                      {deal.original_price && (
                        <div className="text-sm text-zinc-500 line-through">
                          {rs(deal.original_price)}
                        </div>
                      )}
                    </div>
                    {savings != null && savings > 0 && (
                      <span className="rounded-full bg-[#ff6b1a]/15 px-3 py-1 text-xs font-semibold text-[#ff6b1a]">
                        Save {rs(savings)}
                      </span>
                    )}
                  </div>
                  <Link
                    href="/menu"
                    className="mt-4 block rounded-lg border border-zinc-700 py-2 text-center text-sm font-semibold text-white transition-colors hover:border-[#ff6b1a] hover:text-[#ff6b1a]"
                  >
                    Order from Menu
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
