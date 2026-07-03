"use client";

import Link from "next/link";
import { ShoppingBag, ChevronRight } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils/price";
import { cn } from "@/lib/utils/cn";

interface MobileCartBarProps {
  show: boolean;
}

export function MobileCartBar({ show }: MobileCartBarProps) {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());
  const itemCount = items.reduce((n, i) => n + i.quantity, 0);

  if (!show || itemCount === 0) return null;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 md:hidden",
        "animate-fade-up pb-[env(safe-area-inset-bottom,0px)]"
      )}
      role="region"
      aria-label="Cart summary"
    >
      <div className="border-t border-brand-gold/40 bg-brand-surface/95 shadow-[0_-8px_30px_rgba(44,26,14,0.12)] backdrop-blur-md">
        <Link
          href="/cart"
          className="flex items-center gap-3 px-4 py-3 active:opacity-90"
        >
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl [background:var(--gradient-saffron)] shadow-sm">
            <ShoppingBag className="h-5 w-5 text-white" />
            <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-charcoal px-1 text-[10px] font-bold text-white">
              {itemCount > 99 ? "99+" : itemCount}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-brand-charcoal">
              {itemCount} {itemCount === 1 ? "item" : "items"} in cart
            </p>
            <p className="font-hand text-xs text-brand-muted">Tap to review your thali</p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-0.5 sm:flex-row sm:items-center sm:gap-2">
            <span className="font-[family-name:var(--font-playfair)] text-base font-bold text-brand-leaf sm:text-lg">
              {formatPrice(total)}
            </span>
            <span className="flex items-center gap-0.5 rounded-full bg-brand-saffron px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-sm sm:px-3 sm:py-2 sm:text-xs">
              View Cart
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
