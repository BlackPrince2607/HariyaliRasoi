"use client";

import { Clock } from "lucide-react";
import type { MenuItem } from "@/lib/api/types";
import { formatPrice } from "@/lib/utils/price";
import { VegBadge } from "@/components/ui/veg-badge";
import { DishImage } from "@/components/ui/dish-image";
import { AddToCartStepper } from "./AddToCartStepper";
import { cn } from "@/lib/utils/cn";

interface MenuCardProps {
  item: MenuItem;
  category?: string;
}

export function MenuCard({ item, category }: MenuCardProps) {
  const image = item.images.find((i) => i.is_primary) ?? item.images[0];
  const disabled = !item.is_available || item.is_out_of_stock;

  return (
    <article
      className={cn(
        "card-hover group relative flex flex-col overflow-hidden rounded-2xl border border-brand-gold/35 bg-brand-surface shadow-[var(--shadow-card)]",
        disabled && "grayscale opacity-60"
      )}
    >
      {/* ── Image area ──────────────────────────────────────────────── */}
      <div className="relative aspect-video overflow-hidden">
        <DishImage
          src={image?.url}
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
        />

        {/* Dark gradient overlay */}
        <div className="card-food-overlay absolute inset-0 pointer-events-none" />

        {/* Category label — top right */}
        {category && (
          <span className="absolute right-3 top-3 rounded-full bg-black/40 px-2.5 py-0.5 font-hand text-[0.65rem] uppercase tracking-widest text-white backdrop-blur-sm">
            {category}
          </span>
        )}

        {/* Bestseller / special ribbon — top left */}
        {(item.is_todays_special || item.is_bestseller) && (
          <span className="ribbon-hand absolute left-3 top-3 rounded-md bg-brand-saffron px-2.5 py-1 text-xs font-bold text-white shadow-md">
            {item.is_todays_special ? "Today's Special" : "🌿 Popular"}
          </span>
        )}
        {item.is_new && !item.is_todays_special && (
          <span className="ribbon-hand absolute left-3 top-3 rounded-md bg-brand-leaf px-2.5 py-1 text-xs font-bold text-white shadow-md">
            New
          </span>
        )}

        {/* Dish name overlaid on image (bottom-left) */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-start gap-2">
            <VegBadge isVeg={item.is_veg} className="mt-0.5 shrink-0" />
            <h3 className="font-[family-name:var(--font-playfair)] text-sm font-semibold leading-snug text-white drop-shadow-sm">
              {item.name}
            </h3>
          </div>
        </div>

        {/* Out-of-stock overlay */}
        {item.is_out_of_stock && (
          <div className="absolute inset-0 flex items-center justify-center bg-brand-charcoal/50 backdrop-blur-[2px]">
            <span className="rounded-full bg-brand-charcoal/90 px-4 py-1.5 text-xs font-semibold text-white">
              Sold out for today
            </span>
          </div>
        )}

        {/* Unavailable overlay */}
        {!item.is_available && !item.is_out_of_stock && (
          <div className="absolute inset-0 flex items-center justify-center bg-brand-charcoal/40">
            <span className="rounded-full bg-white/90 px-4 py-1.5 text-xs font-semibold text-brand-charcoal">
              Currently Unavailable
            </span>
          </div>
        )}
      </div>

      {/* ── Card body ───────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-4">
        {item.description && (
          <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-brand-muted">
            {item.description}
          </p>
        )}

        <div className="mt-4 flex items-end justify-between gap-2 border-t border-brand-gold/25 pt-3">
          {/* Price + prep time */}
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-brand-leaf">
                {formatPrice(Number(item.price))}
              </span>
              {item.original_price && (
                <span className="text-sm text-brand-muted/70 line-through">
                  {formatPrice(Number(item.original_price))}
                </span>
              )}
            </div>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-brand-muted">
              <Clock className="h-3 w-3" />~{item.preparation_time} min
            </p>
          </div>

          {/* Expand-on-hover Add button */}
          {disabled ? (
            <span className="shrink-0 rounded-full bg-brand-gold/20 px-3 py-1.5 text-xs text-brand-muted">
              Unavailable
            </span>
          ) : (
            <AddToCartStepper item={item} />
          )}
        </div>
      </div>
    </article>
  );
}
