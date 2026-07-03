"use client";

import { Minus, Plus } from "lucide-react";
import type { MenuItem } from "@/lib/api/types";
import { useCart } from "@/lib/hooks/useCart";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/lib/utils/cn";

interface AddToCartStepperProps {
  item: MenuItem;
  className?: string;
}

export function AddToCartStepper({ item, className }: AddToCartStepperProps) {
  const { addMenuItem } = useCart();
  const quantity = useCartStore((s) => {
    const cartItem = s.items.find((i) => i.id === item.id);
    return cartItem?.quantity ?? 0;
  });
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  const increment = () => {
    if (quantity === 0) {
      addMenuItem(item);
    } else {
      updateQuantity(item.id, quantity + 1);
    }
  };

  const decrement = () => {
    updateQuantity(item.id, quantity - 1);
  };

  if (quantity === 0) {
    return (
      <button
        type="button"
        onClick={increment}
        className={cn(
          "flex h-9 shrink-0 items-center justify-center gap-1 rounded-full px-3.5 text-sm font-semibold text-white shadow-sm transition-all [background:var(--gradient-saffron)] hover:brightness-110 active:scale-95",
          className
        )}
        aria-label={`Add ${item.name} to cart`}
      >
        <Plus className="h-4 w-4" />
        Add
      </button>
    );
  }

  return (
    <div
      className={cn(
        "flex h-9 shrink-0 items-center overflow-hidden rounded-full shadow-sm [background:var(--gradient-saffron)]",
        className
      )}
      role="group"
      aria-label={`${item.name} quantity`}
    >
      <button
        type="button"
        onClick={decrement}
        className="flex h-full w-9 items-center justify-center text-white transition-colors hover:bg-black/10 active:bg-black/15"
        aria-label={`Remove one ${item.name}`}
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="min-w-[1.75rem] px-1 text-center text-sm font-bold text-white">
        {quantity}
      </span>
      <button
        type="button"
        onClick={increment}
        className="flex h-full w-9 items-center justify-center text-white transition-colors hover:bg-black/10 active:bg-black/15"
        aria-label={`Add one ${item.name}`}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
