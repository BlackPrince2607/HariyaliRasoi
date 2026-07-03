"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface MenuFiltersProps {
  vegOnly: boolean;
  onVegToggle: () => void;
  search: string;
  onSearchChange: (q: string) => void;
}

export function MenuFilters({
  vegOnly,
  onVegToggle,
  search,
  onSearchChange,
}: MenuFiltersProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-brand-gold/35 bg-brand-surface/90 p-4 shadow-[var(--shadow-card)] backdrop-blur">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
        <input
          type="search"
          placeholder="Search dishes, tags..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-full border border-brand-gold/30 bg-brand-cream/40 py-3 pl-10 pr-4 text-sm text-brand-charcoal transition-shadow placeholder:text-brand-muted/70 focus:border-brand-saffron/50 focus:outline-none focus:ring-2 focus:ring-brand-saffron/20"
        />
      </div>

      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={onVegToggle}
          className={cn(
            "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
            vegOnly
              ? "bg-brand-leaf text-white shadow-sm"
              : "border border-brand-leaf/30 bg-brand-cream/80 text-brand-leaf hover:bg-brand-cream"
          )}
        >
          <span
            className={cn(
              "inline-flex h-3.5 w-3.5 items-center justify-center rounded-[3px] border",
              vegOnly ? "border-white" : "border-brand-leaf"
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", vegOnly ? "bg-white" : "bg-brand-leaf")} />
          </span>
          Pure Veg
        </button>
      </div>
    </div>
  );
}
