"use client";

import Link from "next/link";
import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { validateCoupon } from "@/lib/api/admin";
import { formatPrice } from "@/lib/utils/price";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CartItem } from "./CartItem";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";

export function CartDrawer() {
  const items = useCartStore((s) => s.items);
  const coupon = useCartStore((s) => s.coupon);
  const deliveryFee = useCartStore((s) => s.deliveryFee);
  const freeDeliveryThreshold = useCartStore((s) => s.freeDeliveryThreshold);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const subtotal = useCartStore((s) => s.subtotal());
  const total = useCartStore((s) => s.total());

  const [couponInput, setCouponInput] = useState("");

  const threshold = Number(freeDeliveryThreshold);
  const fee = Number(deliveryFee);
  const computedDeliveryFee = subtotal >= threshold ? 0 : fee;
  const discount = Number(coupon?.discount_amount ?? 0);
  const itemCount = items.reduce((n, i) => n + i.quantity, 0);

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

  if (items.length === 0) {
    return (
      <EmptyState
        motif="pot"
        title="Your thali is empty"
        description="Add some homestyle dishes from our menu and they'll appear here."
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-brand-charcoal">
          Your Order
        </h2>
        <span className="rounded-full bg-brand-saffron/15 px-2.5 py-0.5 text-xs font-semibold text-brand-saffron">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
      </div>

      {/* Item list */}
      <div className="space-y-3">
        {items.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
          />
        ))}
      </div>

      {/* Coupon section */}
      <div className="border-t border-dashed border-brand-gold/50 pt-4">
        <p className="font-hand text-brand-saffron">Have a code?</p>
        <div className="mt-2 flex gap-2">
          <Input
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value)}
            placeholder="Enter coupon code"
            className="rounded-full"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleApplyCoupon}
            className="shrink-0"
          >
            Apply
          </Button>
        </div>
        {coupon && (
          <p className="mt-2 text-xs text-brand-leaf">
            {coupon.code} applied (−{formatPrice(coupon.discount_amount)})
          </p>
        )}
      </div>

      {/* Totals breakdown */}
      <div className="space-y-2 border-t border-brand-gold/30 pt-4 text-sm">
        <div className="flex justify-between text-brand-muted">
          <span>Subtotal</span>
          <span className="text-brand-charcoal">{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-brand-leaf">
            <span>Discount</span>
            <span>−{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-brand-muted">
          <span>Delivery fee</span>
          <span className="text-brand-charcoal">
            {computedDeliveryFee === 0 ? "FREE" : formatPrice(computedDeliveryFee)}
          </span>
        </div>
        <div className="flex justify-between border-t border-brand-gold/25 pt-2">
          <span className="font-bold text-brand-charcoal">Total</span>
          <span className="font-[family-name:var(--font-playfair)] text-xl font-bold text-brand-leaf">
            {formatPrice(total)}
          </span>
        </div>
      </div>

      {/* CTA — desktop inline; mobile uses sticky MobileCheckoutBar */}
      <Link
        href="#checkout"
        className="hidden w-full items-center justify-center rounded-2xl py-4 text-lg font-semibold text-white shadow-[var(--shadow-warm)] transition-all duration-200 hover:scale-[1.01] hover:brightness-110 active:scale-[0.98] lg:flex [background:var(--gradient-saffron)]"
      >
        Proceed to Checkout →
      </Link>
    </div>
  );
}
