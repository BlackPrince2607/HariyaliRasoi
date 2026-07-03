"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartItem as CartItemType } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils/price";
import { DishImage } from "@/components/ui/dish-image";
import { VegBadge } from "@/components/ui/veg-badge";

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const unitPrice = Number(item.price);
  const quantity = Number(item.quantity);
  const lineTotal = unitPrice * quantity;

  return (
    <div className="flex gap-3 rounded-2xl border border-brand-gold/35 bg-brand-surface p-3 shadow-[var(--shadow-card)]">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
        <DishImage src={item.image_url} alt={item.name} sizes="64px" />
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 font-medium text-brand-charcoal">
              <VegBadge isVeg={item.is_veg} className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{item.name}</span>
            </p>
            <p className="mt-0.5 text-xs text-brand-muted">
              {formatPrice(unitPrice)}
              {quantity > 1 && ` × ${quantity}`}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <p className="font-semibold text-brand-leaf">{formatPrice(lineTotal)}</p>
            <button
              onClick={() => onRemove(item.id)}
              className="text-brand-muted transition-colors hover:text-red-600"
              aria-label="Remove item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="mt-auto flex items-center gap-2 pt-2">
          <button
            onClick={() => onUpdateQuantity(item.id, quantity - 1)}
            className="rounded-full border border-brand-gold/50 p-1 text-brand-charcoal transition-colors hover:bg-brand-cream"
            aria-label="Decrease quantity"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="w-6 text-center text-sm font-semibold text-brand-charcoal">
            {quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(item.id, quantity + 1)}
            className="rounded-full border border-brand-gold/50 p-1 text-brand-charcoal transition-colors hover:bg-brand-cream"
            aria-label="Increase quantity"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
