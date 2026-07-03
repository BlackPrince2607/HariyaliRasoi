import type { Order } from "@/lib/api/types";

/** Pre-filled text when customers tap the floating WhatsApp button. */
export const DEFAULT_WHATSAPP_GREETING =
  "Hi! I'd like to place an order from Hariyali Rasoi. 🌿";

const PLACEHOLDER_WHATSAPP_NUMBERS = new Set(["919999999999", "9999999999", "99999999999"]);

/** Pick the first real WhatsApp number (settings API beats frontend env). */
export function resolveWhatsappNumber(...candidates: Array<string | undefined>): string {
  for (const candidate of candidates) {
    const normalized = normalizeWhatsappNumber(candidate || "");
    if (normalized && !PLACEHOLDER_WHATSAPP_NUMBERS.has(normalized)) {
      return normalized;
    }
  }
  return "";
}

/** Strip non-digits and leading 0 for wa.me links (e.g. 919876543210). */
export function normalizeWhatsappNumber(number: string): string {
  const digits = number.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("0")) {
    return digits.slice(1);
  }
  return digits;
}

/** Open WhatsApp chat with optional pre-filled message (wa.me deep link). */
export function buildWhatsAppLink(number: string, text?: string): string {
  const normalized = normalizeWhatsappNumber(number);
  if (!normalized) return "";
  const base = `https://wa.me/${normalized}`;
  const message = text?.trim();
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function buildWhatsAppMessage(order: Order, whatsappNumber: string): string {
  const normalized = normalizeWhatsappNumber(whatsappNumber);
  if (!normalized) return "";
  const lines = order.items.map((i) => `• ${i.name} x${i.quantity} — ₹${i.subtotal}`);
  const msg = [
    "🌿 *New Order - Hariyali Rasoi*",
    "━━━━━━━━━━━━━━━━━━━━━",
    `*Order #:* ${order.order_number}`,
    `*Name:* ${order.customer_name}`,
    `*Phone:* ${order.customer_phone}`,
    `*Address:* ${order.delivery_address}`,
    "",
    "*Items:*",
    ...lines,
    "",
    `*Subtotal:* ₹${order.subtotal}`,
    `*Discount:* -₹${order.discount}`,
    `*Delivery:* ₹${order.delivery_fee}`,
    `*Total:* ₹${order.total}`,
    "",
    `*Payment:* ${order.payment_method === "upi" ? "UPI" : "Cash on Delivery"}`,
    order.order_notes ? `*Notes:* ${order.order_notes}` : "",
    "━━━━━━━━━━━━━━━━━━━━━",
  ]
    .filter(Boolean)
    .join("\n");

  return buildWhatsAppLink(normalized, msg);
}

/** Plain-text order summary for admin alerts / WhatsApp share. */
export function buildOrderSummaryText(order: Order): string {
  const lines = order.items.map((i) => `• ${i.name} x${i.quantity} — ₹${i.subtotal}`);
  return [
    "🔔 NEW ORDER - Hariyali Rasoi",
    "━━━━━━━━━━━━━━━━━━━━━",
    `Order #: ${order.order_number}`,
    `Name: ${order.customer_name}`,
    `Phone: ${order.customer_phone}`,
    `Address: ${order.delivery_address}`,
    "",
    "Items:",
    ...lines,
    "",
    `Total: ₹${order.total}`,
    `Payment: ${order.payment_method === "upi" ? "UPI" : "Cash on Delivery"}`,
    order.order_notes ? `Notes: ${order.order_notes}` : "",
    "━━━━━━━━━━━━━━━━━━━━━",
  ]
    .filter(Boolean)
    .join("\n");
}

/** Message from kitchen to customer about order status. */
export function buildCustomerStatusMessage(
  order: Order,
  status: "accepted" | "rejected"
): string {
  if (status === "accepted") {
    return [
      `Hi ${order.customer_name}!`,
      "",
      `Your Hariyali Rasoi order *${order.order_number}* has been *confirmed*.`,
      "We're preparing your meal now.",
      "",
      `Total: ₹${order.total}`,
      "",
      "Thank you! 🌿",
    ].join("\n");
  }
  return [
    `Hi ${order.customer_name},`,
    "",
    `Sorry — we could not accept order *${order.order_number}* at this time.`,
    "Please reply here if you'd like to reorder or need help.",
    "",
    "— Hariyali Rasoi",
  ].join("\n");
}

/** Open WhatsApp chat with the customer (admin notify on accept/reject). */
export function buildWhatsAppToCustomer(order: Order, message: string): string {
  const phone = normalizeWhatsappNumber(order.customer_phone);
  if (!phone) return "";
  const withCountry =
    phone.length === 10 ? `91${phone}` : phone.startsWith("91") ? phone : `91${phone}`;
  return buildWhatsAppLink(withCountry, message);
}

/** Opens WhatsApp share picker with pre-filled text (pick any chat/group). */
export function buildWhatsAppShareLink(text: string): string {
  const message = text.trim();
  if (!message) return "";
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
