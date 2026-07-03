"use client";

import { CartDrawer } from "@/components/public/CartDrawer";
import { CheckoutForm } from "@/components/public/CheckoutForm";
import { MobileCheckoutBar } from "@/components/public/MobileCheckoutBar";
import { useCartStore } from "@/store/cartStore";
import { useCartSync } from "@/lib/hooks/useCartSync";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  useCartSync();

  return (
    <>
      <div className="px-4 py-8 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] lg:pb-8">
        <div className="mx-auto max-w-4xl">
          <p className="font-hand text-xl text-brand-saffron">almost there</p>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-brand-charcoal md:text-4xl">
            Your Cart
          </h1>
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="mb-4 font-semibold text-brand-charcoal">Items</h2>
              <CartDrawer />
            </div>
            {items.length > 0 && (
              <div id="checkout" className="scroll-mt-20">
                <h2 className="mb-4 font-semibold text-brand-charcoal">Checkout</h2>
                <div className="rounded-2xl border border-brand-gold/35 bg-brand-surface p-5 shadow-[var(--shadow-card)]">
                  <CheckoutForm />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <MobileCheckoutBar />
    </>
  );
}
