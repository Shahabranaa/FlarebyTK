"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Flame, Minus, Plus, Tag } from "lucide-react";
import { useCart } from "@/lib/cart";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

interface MenuItem {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  category_id: number | null;
  price: string;
  original_price: string | null;
  image_url: string | null;
  is_featured: boolean;
  calories: number | null;
  tags: string[];
}

interface Deal {
  id: number;
  title: string;
  description: string | null;
  image_url: string | null;
  original_price: string | null;
  deal_price: string;
}

function rs(value: string | number): string {
  return `Rs. ${Math.round(Number(value)).toLocaleString("en-PK")}`;
}

function ItemCard({ item }: { item: MenuItem }) {
  const { items, add, setQty } = useCart();
  const inCart = items.find((i) => i.id === item.id);

  return (
    <div className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition-colors hover:border-zinc-700">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-white">{item.name}</h3>
          {item.is_featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#ff6b1a]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#ff6b1a]">
              <Flame className="h-3 w-3" /> Popular
            </span>
          )}
        </div>
        {item.description && (
          <p className="mt-1 line-clamp-2 text-sm text-zinc-400">
            {item.description}
          </p>
        )}
        <div className="mt-2 flex items-center gap-3">
          <span className="font-semibold text-[#ff6b1a]">{rs(item.price)}</span>
          {item.original_price && (
            <span className="text-sm text-zinc-500 line-through">
              {rs(item.original_price)}
            </span>
          )}
          {item.calories != null && (
            <span className="text-xs text-zinc-500">{item.calories} cal</span>
          )}
        </div>
        <div className="mt-3">
          {inCart ? (
            <div className="inline-flex items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1">
              <button
                onClick={() => setQty(item.id, inCart.qty - 1)}
                className="rounded p-1 text-zinc-300 hover:text-[#ff6b1a]"
                aria-label={`Remove one ${item.name}`}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-5 text-center text-sm font-semibold text-white">
                {inCart.qty}
              </span>
              <button
                onClick={() => setQty(item.id, inCart.qty + 1)}
                className="rounded p-1 text-zinc-300 hover:text-[#ff6b1a]"
                aria-label={`Add one ${item.name}`}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() =>
                add({ id: item.id, name: item.name, price: Number(item.price) })
              }
              className="rounded-lg bg-[#ff6b1a] px-4 py-1.5 text-sm font-semibold text-black transition-colors hover:bg-[#e05a10]"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
      {item.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image_url}
          alt={item.name}
          className="h-[110px] w-[110px] shrink-0 rounded-lg object-cover"
          loading="lazy"
        />
      )}
    </div>
  );
}

export default function MenuSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>("most-selling");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [catRes, itemRes, dealRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/menu-items?available=true"),
          fetch("/api/deals?active=true"),
        ]);
        if (!catRes.ok || !itemRes.ok || !dealRes.ok) {
          throw new Error("Failed to load menu");
        }
        const [cats, menuItems, activeDeals] = await Promise.all([
          catRes.json(),
          itemRes.json(),
          dealRes.json(),
        ]);
        if (!cancelled) {
          setCategories(cats);
          setItems(menuItems);
          setDeals(activeDeals);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load menu");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const featured = useMemo(() => items.filter((i) => i.is_featured), [items]);
  const byCategory = useMemo(() => {
    const map = new Map<number, MenuItem[]>();
    for (const item of items) {
      if (item.category_id == null) continue;
      const list = map.get(item.category_id) ?? [];
      list.push(item);
      map.set(item.category_id, list);
    }
    return map;
  }, [items]);

  const sections = useMemo(() => {
    const list: { id: string; label: string }[] = [];
    if (featured.length > 0)
      list.push({ id: "most-selling", label: "Most Selling" });
    if (deals.length > 0)
      list.push({ id: "todays-deals", label: "Today's Deals" });
    for (const cat of categories) {
      if ((byCategory.get(cat.id) ?? []).length > 0) {
        list.push({ id: `cat-${cat.slug}`, label: cat.name });
      }
    }
    return list;
  }, [featured, deals, categories, byCategory]);

  useEffect(() => {
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-140px 0px -60% 0px", threshold: 0 },
    );
    for (const section of sections) {
      const el = sectionRefs.current[section.id];
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  function scrollTo(id: string) {
    const el = sectionRefs.current[id];
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 130;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-zinc-400">
        Loading menu…
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-zinc-400">
        Couldn&apos;t load the menu right now. Please refresh the page.
      </div>
    );
  }

  return (
    <div id="menu" className="mx-auto max-w-6xl px-4 pb-20">
      <nav className="no-scrollbar sticky top-16 z-40 -mx-4 flex gap-2 overflow-x-auto border-b border-zinc-800 bg-[#0a0a0a]/95 px-4 py-3 backdrop-blur">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => scrollTo(section.id)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeSection === section.id
                ? "bg-[#ff6b1a] text-black"
                : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            {section.label}
          </button>
        ))}
      </nav>

      {featured.length > 0 && (
        <section
          id="most-selling"
          ref={(el) => {
            sectionRefs.current["most-selling"] = el;
          }}
          className="pt-10"
        >
          <h2 className="font-heading text-3xl tracking-wide text-white">
            MOST <span className="text-[#ff6b1a]">SELLING</span>
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {featured.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {deals.length > 0 && (
        <section
          id="todays-deals"
          ref={(el) => {
            sectionRefs.current["todays-deals"] = el;
          }}
          className="pt-12"
        >
          <h2 className="font-heading text-3xl tracking-wide text-white">
            TODAY&apos;S <span className="text-[#ff6b1a]">DEALS</span>
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {deals.map((deal) => (
              <Link
                key={deal.id}
                href="/deals"
                className="group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition-colors hover:border-[#ff6b1a]/50"
              >
                {deal.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={deal.image_url}
                    alt={deal.title}
                    className="h-36 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 text-[#ff6b1a]">
                    <Tag className="h-4 w-4" />
                    <h3 className="font-semibold text-white">{deal.title}</h3>
                  </div>
                  {deal.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-zinc-400">
                      {deal.description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-3">
                    <span className="font-semibold text-[#ff6b1a]">
                      {rs(deal.deal_price)}
                    </span>
                    {deal.original_price && (
                      <span className="text-sm text-zinc-500 line-through">
                        {rs(deal.original_price)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {categories.map((cat) => {
        const catItems = byCategory.get(cat.id) ?? [];
        if (catItems.length === 0) return null;
        const sectionId = `cat-${cat.slug}`;
        return (
          <section
            key={cat.id}
            id={sectionId}
            ref={(el) => {
              sectionRefs.current[sectionId] = el;
            }}
            className="pt-12"
          >
            <h2 className="font-heading text-3xl uppercase tracking-wide text-white">
              {cat.name}
            </h2>
            {cat.description && (
              <p className="mt-1 text-sm text-zinc-400">{cat.description}</p>
            )}
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {catItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
