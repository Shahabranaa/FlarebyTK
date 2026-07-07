import { Order, rs } from "@/lib/api";

/** Converts a Pakistani phone number to international digits for wa.me. */
export function waPhone(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("92")) return digits;
  if (digits.startsWith("0")) return `92${digits.slice(1)}`;
  if (digits.length === 10 && digits.startsWith("3")) return `92${digits}`;
  return digits;
}

export function waLink(phone: string, message: string): string {
  return `https://wa.me/${waPhone(phone)}?text=${encodeURIComponent(message)}`;
}

/** Replaces {placeholders} in a template. Unknown placeholders are left as-is. */
export function fillTemplate(
  template: string,
  vars: Record<string, string>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? vars[key] : match,
  );
}

export const TEMPLATE_KEYS = {
  confirm: "order_confirm_template",
  onTheWay: "order_ontheway_template",
} as const;

export const DEFAULT_TEMPLATES: Record<string, string> = {
  [TEMPLATE_KEYS.confirm]: `Hi {customer_name}! Your order #{order_no} is confirmed. ✅

{items}
Total: {total}

Estimated time: 30–45 minutes.

Thank you for ordering from Flare by TK! 🔥`,
  [TEMPLATE_KEYS.onTheWay]: `Hi {customer_name}! Your order #{order_no} is on its way! 🛵
Rider: {rider_name} ({rider_phone})

{items}
Total: {total}

To pay by bank transfer:
(Add your bank details in Admin → Settings)`,
};

export function templateVars(order: Order): Record<string, string> {
  const items = (order.items ?? [])
    .map((i) => `${i.qty}× ${i.name} — ${rs(i.price * i.qty)}`)
    .join("\n");
  return {
    customer_name: order.customer_name,
    order_no: order.pos_number || String(order.id),
    items,
    total: rs(order.total_amount),
    rider_name: order.rider_name ?? "",
    rider_phone: order.rider_phone ?? "",
  };
}
