"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { createOrder } from "@/lib/api/orders";
import { validateCoupon } from "@/lib/api/admin";
import { formatPrice } from "@/lib/utils/price";
import { useStore } from "@/lib/hooks/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UpiPaymentModal } from "./UpiPaymentModal";
import { toast } from "sonner";
import { Coins, QrCode } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { syncCartWithMenu } from "@/lib/utils/cartSync";
import { buildWhatsAppMessage, resolveWhatsappNumber } from "@/lib/utils/whatsapp";
import { openWhatsApp } from "@/lib/utils/openWhatsApp";

function normalizeIndianPhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11 && cleaned.startsWith("0")) {
    cleaned = cleaned.slice(1);
  }
  return cleaned;
}

const schema = z.object({
  customer_name: z.string().min(2, "Name is required"),
  customer_phone: z
    .string()
    .min(10, "Valid phone required")
    .transform(normalizeIndianPhone)
    .refine(
      (v) => v.length === 10 || (v.length === 12 && v.startsWith("91")),
      "Enter a valid 10-digit Indian mobile number"
    ),
  customer_email: z.string().email().optional().or(z.literal("")),
  delivery_address: z.string().min(5, "Address is required"),
  order_notes: z.string().optional(),
  payment_method: z.enum(["cod", "upi"]),
  coupon_code: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function CheckoutForm() {
  const router = useRouter();
  const { settings, isOpen } = useStore();

  const sendOrderToWhatsApp = (order: Awaited<ReturnType<typeof createOrder>>) => {
    const number = resolveWhatsappNumber(
      settings?.whatsapp,
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
    );
    const href = buildWhatsAppMessage(order, number);
    if (!href) return;
    sessionStorage.setItem(`wa_notified_${order.id}`, "1");
    openWhatsApp(href);
  };
  const items = useCartStore((s) => s.items);
  const coupon = useCartStore((s) => s.coupon);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);
  const subtotal = useCartStore((s) => s.subtotal());
  const total = useCartStore((s) => s.total());
  const freeDeliveryThreshold = Number(useCartStore.getState().freeDeliveryThreshold);
  const deliveryFeeSetting = Number(useCartStore.getState().deliveryFee);
  const deliveryFee = subtotal >= freeDeliveryThreshold ? 0 : deliveryFeeSetting;
  const clearCart = useCartStore((s) => s.clearCart);
  const setCartItems = useCartStore((s) => s.setItems);

  const [loading, setLoading] = useState(false);
  const [upiOrder, setUpiOrder] = useState<Awaited<ReturnType<typeof createOrder>> | null>(null);
  const [couponInput, setCouponInput] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { payment_method: "cod" },
  });

  const paymentMethod = watch("payment_method");

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    try {
      const result = await validateCoupon(couponInput, subtotal);
      if (result.valid) {
        applyCoupon({
          code: couponInput.toUpperCase(),
          discount_amount: Number(result.discount_amount),
        });
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Could not validate coupon");
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!isOpen) {
      toast.error(settings?.closed_message || "Store is closed");
      return;
    }
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    if (subtotal < (settings?.min_order_amount ?? 100)) {
      toast.error(`Minimum order is ${formatPrice(settings?.min_order_amount ?? 100)}`);
      return;
    }

    setLoading(true);
    try {
      const { items: syncedItems, removed } = await syncCartWithMenu(items);
      if (removed.length > 0) {
        setCartItems(syncedItems);
        const names = removed.map((r) => r.name).join(", ");
        toast.error(
          removed.some((r) => r.reason.includes("menu"))
            ? `${names} — your cart was outdated. Please add items from the menu again.`
            : `${names} — no longer available. Your cart was updated.`
        );
        if (syncedItems.length === 0) {
          return;
        }
      }

      const order = await createOrder({
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        customer_email: data.customer_email || undefined,
        delivery_address: data.delivery_address,
        order_notes: data.order_notes || undefined,
        payment_method: data.payment_method,
        coupon_code: coupon?.code,
        items: syncedItems.map((i) => ({ menu_item_id: i.id, quantity: i.quantity })),
      });

      sessionStorage.setItem("last_order", JSON.stringify(order));
      sessionStorage.setItem("last_order_phone", data.customer_phone);

      sendOrderToWhatsApp(order);

      if (data.payment_method === "upi") {
        setUpiOrder(order);
      } else {
        clearCart();
        router.push(`/order-confirmation?order=${order.order_number}`);
      }
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail;
      let msg = "Failed to place order";
      if (typeof detail === "string") {
        msg = detail;
      } else if (Array.isArray(detail) && detail[0] && typeof detail[0] === "object" && "msg" in detail[0]) {
        msg = String((detail[0] as { msg: string }).msg).replace(/^Value error,\s*/i, "");
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleUpiComplete = () => {
    if (upiOrder) {
      clearCart();
      router.push(`/order-confirmation?order=${upiOrder.order_number}`);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="customer_name">Full Name *</Label>
            <Input id="customer_name" {...register("customer_name")} className="mt-1" />
            {errors.customer_name && <p className="mt-1 text-xs text-red-500">{errors.customer_name.message}</p>}
          </div>
          <div>
            <Label htmlFor="customer_phone">Phone *</Label>
            <Input id="customer_phone" {...register("customer_phone")} className="mt-1" />
            {errors.customer_phone && <p className="mt-1 text-xs text-red-500">{errors.customer_phone.message}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="customer_email">Email (optional)</Label>
          <Input id="customer_email" type="email" {...register("customer_email")} className="mt-1" />
        </div>

        <div>
          <Label htmlFor="delivery_address">Delivery Address *</Label>
          <Textarea id="delivery_address" {...register("delivery_address")} className="mt-1" rows={3} />
          {errors.delivery_address && <p className="mt-1 text-xs text-red-500">{errors.delivery_address.message}</p>}
        </div>

        <div>
          <Label htmlFor="order_notes">Order Notes</Label>
          <Textarea id="order_notes" {...register("order_notes")} className="mt-1" placeholder="Any special instructions?" />
        </div>

        <div>
          <Label>Payment Method</Label>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <label
              className={cn(
                "flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center transition-all",
                paymentMethod === "cod"
                  ? "border-brand-saffron bg-brand-saffron/10"
                  : "border-brand-gold/35 bg-brand-surface hover:border-brand-gold/60"
              )}
            >
              <input type="radio" value="cod" {...register("payment_method")} className="sr-only" />
              <Coins
                className={cn("h-7 w-7", paymentMethod === "cod" ? "text-brand-saffron" : "text-brand-muted")}
              />
              <span className="text-sm font-semibold text-brand-charcoal">Cash on Delivery</span>
            </label>
            <label
              className={cn(
                "flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center transition-all",
                paymentMethod === "upi"
                  ? "border-brand-saffron bg-brand-saffron/10"
                  : "border-brand-gold/35 bg-brand-surface hover:border-brand-gold/60"
              )}
            >
              <input type="radio" value="upi" {...register("payment_method")} className="sr-only" />
              <QrCode
                className={cn("h-7 w-7", paymentMethod === "upi" ? "text-brand-saffron" : "text-brand-muted")}
              />
              <span className="text-sm font-semibold text-brand-charcoal">Pay via UPI</span>
            </label>
          </div>
        </div>

        <div>
          <Label>Coupon Code</Label>
          <div className="mt-1 flex gap-2">
            <Input value={couponInput} onChange={(e) => setCouponInput(e.target.value)} placeholder="WELCOME10" />
            <Button type="button" variant="outline" onClick={handleApplyCoupon}>
              Apply
            </Button>
          </div>
          {coupon && (
            <p className="mt-1 text-sm text-brand-leaf">
              {coupon.code} applied (-{formatPrice(coupon.discount_amount)})
              <button type="button" onClick={removeCoupon} className="ml-2 text-red-500 underline">
                Remove
              </button>
            </p>
          )}
        </div>

        <div className="space-y-2 rounded-2xl border border-brand-gold/35 bg-brand-cream/50 p-4 text-sm">
          <div className="flex justify-between text-brand-charcoal/80">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {coupon && (
            <div className="flex justify-between text-brand-leaf">
              <span>Discount</span>
              <span>-{formatPrice(coupon.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between text-brand-charcoal/80">
            <span>Delivery</span>
            <span>{deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee)}</span>
          </div>
          <div className="flex justify-between border-t border-brand-gold/30 pt-2 text-base font-bold text-brand-charcoal">
            <span>Total</span>
            <span className="text-brand-leaf">{formatPrice(total)}</span>
          </div>
        </div>

        {!isOpen && (
          <p className="rounded-xl bg-red-50 px-4 py-2.5 text-center text-sm font-medium text-red-700">
            {settings?.closed_message || "Our kitchen is closed right now — checkout is paused."}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={loading || !isOpen}>
          {loading ? "Placing order…" : paymentMethod === "upi" ? "Place Order & Pay via UPI" : "Place Order"}
        </Button>
      </form>

      {upiOrder && settings && (
        <UpiPaymentModal
          order={upiOrder}
          settings={settings}
          onComplete={handleUpiComplete}
          onClose={() => setUpiOrder(null)}
        />
      )}
    </>
  );
}
