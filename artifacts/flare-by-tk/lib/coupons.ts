export interface CouponRow {
  id: number;
  code: string;
  description: string | null;
  discount_type: "percent" | "fixed" | string;
  discount_value: string | number;
  scope: "order" | "item" | "category" | string;
  item_id: number | null;
  category_id: number | null;
  min_order_amount: string | number | null;
  starts_at: string | Date | null;
  ends_at: string | Date | null;
  days_of_week: number[];
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
}

export interface CouponLine {
  itemId: number;
  categoryId: number | null;
  price: number;
  qty: number;
}

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/** Day of week (0=Sunday) in Pakistan time (UTC+5, no DST). */
export function pakistanDay(now: Date): number {
  return new Date(now.getTime() + 5 * 3600_000).getUTCDay();
}

export type CouponResult =
  | { ok: true; discount: number }
  | { ok: false; reason: string };

/**
 * Evaluates a coupon against an order. All rules are enforced server-side:
 * active flag, schedule window, day-of-week (Pakistan time), usage limit,
 * minimum order amount, and item/category scope.
 */
export function evaluateCoupon(
  coupon: CouponRow,
  lines: CouponLine[],
  subtotal: number,
  now: Date = new Date(),
): CouponResult {
  if (!coupon.is_active) {
    return { ok: false, reason: "This coupon is not active." };
  }
  if (coupon.starts_at && now < new Date(coupon.starts_at)) {
    return { ok: false, reason: "This coupon is not active yet." };
  }
  if (coupon.ends_at && now > new Date(coupon.ends_at)) {
    return { ok: false, reason: "This coupon has expired." };
  }
  if (
    Array.isArray(coupon.days_of_week) &&
    coupon.days_of_week.length > 0 &&
    !coupon.days_of_week.includes(pakistanDay(now))
  ) {
    const days = coupon.days_of_week
      .map((d) => DAY_NAMES[d] ?? "")
      .filter(Boolean)
      .join(", ");
    return {
      ok: false,
      reason: days
        ? `This coupon is only valid on: ${days}.`
        : "This coupon is not valid today.",
    };
  }
  if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
    return { ok: false, reason: "This coupon has been fully redeemed." };
  }
  const minOrder =
    coupon.min_order_amount === null ? null : Number(coupon.min_order_amount);
  if (minOrder !== null && subtotal < minOrder) {
    return {
      ok: false,
      reason: `This coupon requires a minimum order of Rs. ${Math.round(minOrder).toLocaleString("en-PK")}.`,
    };
  }

  let eligible = subtotal;
  if (coupon.scope === "item") {
    if (coupon.item_id === null) {
      return { ok: false, reason: "This coupon is no longer valid." };
    }
    eligible = lines
      .filter((l) => l.itemId === coupon.item_id)
      .reduce((sum, l) => sum + l.price * l.qty, 0);
    if (eligible <= 0) {
      return {
        ok: false,
        reason: "This coupon applies to a specific item that isn’t in your cart.",
      };
    }
  } else if (coupon.scope === "category") {
    if (coupon.category_id === null) {
      return { ok: false, reason: "This coupon is no longer valid." };
    }
    eligible = lines
      .filter((l) => l.categoryId === coupon.category_id)
      .reduce((sum, l) => sum + l.price * l.qty, 0);
    if (eligible <= 0) {
      return {
        ok: false,
        reason:
          "This coupon applies to a specific category that isn’t in your cart.",
      };
    }
  }

  const value = Number(coupon.discount_value);
  if (!Number.isFinite(value) || value <= 0) {
    return { ok: false, reason: "This coupon is not valid." };
  }

  let discount =
    coupon.discount_type === "fixed"
      ? Math.min(value, eligible)
      : (eligible * Math.min(value, 100)) / 100;
  discount = Math.min(Math.round(discount), Math.round(subtotal));
  if (discount <= 0) {
    return { ok: false, reason: "This coupon is not valid." };
  }
  return { ok: true, discount };
}

export function normalizeCode(raw: unknown): string {
  return typeof raw === "string" ? raw.trim().toUpperCase() : "";
}

export const COUPON_COLUMNS = `id, code, description, discount_type, discount_value,
  scope, item_id, category_id, min_order_amount, starts_at, ends_at,
  days_of_week, max_uses, used_count, is_active`;
