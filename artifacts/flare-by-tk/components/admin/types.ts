export interface AdminCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  item_count: number;
}

export interface AdminMenuItem {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  category_id: number | null;
  price: string;
  original_price: string | null;
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
  calories: number | null;
  category_name?: string | null;
}

export function rs(value: string | number): string {
  return `Rs. ${Math.round(Number(value)).toLocaleString("en-PK")}`;
}

export const inputCls =
  "w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-[#ff6b1a]";

export const labelCls =
  "mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-400";

export const primaryBtn =
  "rounded-lg bg-[#ff6b1a] px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#e05a10] disabled:opacity-60";

export const secondaryBtn =
  "rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-[#ff6b1a] disabled:opacity-60";
