import { normalizeCode } from "./coupons";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseCouponBody(body: any): { error: string } | Record<string, unknown> {
  const code = normalizeCode(body?.code);
  if (!code || !/^[A-Z0-9_-]{2,30}$/.test(code)) {
    return {
      error:
        "Code is required: 2–30 letters, numbers, dashes or underscores (e.g. FLARE20).",
    };
  }
  const discountType = body?.discount_type;
  if (discountType !== "percent" && discountType !== "fixed") {
    return { error: "Discount type must be 'percent' or 'fixed'." };
  }
  const discountValue = Number(body?.discount_value);
  if (!Number.isFinite(discountValue) || discountValue <= 0) {
    return { error: "Discount value must be a positive number." };
  }
  if (discountType === "percent" && discountValue > 100) {
    return { error: "Percent discount cannot exceed 100." };
  }
  const scope = body?.scope ?? "order";
  if (scope !== "order" && scope !== "item" && scope !== "category") {
    return { error: "Scope must be 'order', 'item' or 'category'." };
  }
  let itemId: number | null = null;
  let categoryId: number | null = null;
  if (scope === "item") {
    itemId = Number.parseInt(String(body?.item_id), 10);
    if (Number.isNaN(itemId)) {
      return { error: "Pick the menu item this coupon applies to." };
    }
  }
  if (scope === "category") {
    categoryId = Number.parseInt(String(body?.category_id), 10);
    if (Number.isNaN(categoryId)) {
      return { error: "Pick the category this coupon applies to." };
    }
  }
  const minOrder =
    body?.min_order_amount === null ||
    body?.min_order_amount === undefined ||
    body?.min_order_amount === ""
      ? null
      : Number(body.min_order_amount);
  if (minOrder !== null && (!Number.isFinite(minOrder) || minOrder < 0)) {
    return { error: "Minimum order must be a positive number." };
  }
  const parseDate = (v: unknown): Date | null | { error: string } => {
    if (v === null || v === undefined || v === "") return null;
    const d = new Date(String(v));
    return Number.isNaN(d.getTime())
      ? { error: "Invalid date/time value." }
      : d;
  };
  const startsAt = parseDate(body?.starts_at);
  if (startsAt && "error" in startsAt) return startsAt;
  const endsAt = parseDate(body?.ends_at);
  if (endsAt && "error" in endsAt) return endsAt;
  if (startsAt && endsAt && endsAt <= startsAt) {
    return { error: "End time must be after start time." };
  }
  let daysOfWeek: number[] = [];
  if (Array.isArray(body?.days_of_week)) {
    const nums: number[] = body.days_of_week.map((d: unknown) => Number(d));
    daysOfWeek = [...new Set(nums)]
      .filter((d) => Number.isInteger(d) && d >= 0 && d <= 6)
      .sort();
    if (daysOfWeek.length === 7) daysOfWeek = [];
  }
  const maxUses =
    body?.max_uses === null || body?.max_uses === undefined || body?.max_uses === ""
      ? null
      : Math.trunc(Number(body.max_uses));
  if (maxUses !== null && (!Number.isFinite(maxUses) || maxUses < 1)) {
    return { error: "Usage limit must be at least 1." };
  }
  return {
    code,
    description:
      typeof body?.description === "string" && body.description.trim()
        ? body.description.trim()
        : null,
    discount_type: discountType,
    discount_value: discountValue,
    scope,
    item_id: itemId,
    category_id: categoryId,
    min_order_amount: minOrder,
    starts_at: startsAt,
    ends_at: endsAt,
    days_of_week: daysOfWeek,
    max_uses: maxUses,
    is_active: body?.is_active === undefined ? true : !!body.is_active,
  };
}
