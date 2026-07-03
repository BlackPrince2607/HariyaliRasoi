"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils/price";

export function MobileCheckoutBar() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());

  if (items.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-gold/40 bg-brand-surface/95 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-8px_30px_rgba(44,26,14,0.12)] backdrop-blur-md lg:hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-brand-muted">Order total</p>
          <p className="font-[family-name:var(--font-playfair)] text-xl font-bold text-brand-leaf">
            {formatPrice(total)}
          </p>
        </div>
        <Link
          href="#checkout"
          className="shrink-0 rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-[var(--shadow-warm)] [background:var(--gradient-saffron)] active:scale-[0.98]"
        >
          Checkout →
        </Link>
      </div>
    </div>
  );
}
