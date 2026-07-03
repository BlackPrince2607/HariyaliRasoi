"use client";

import { useEffect, useRef } from "react";
import { useMenuPageStore } from "@/store/menuPageStore";
import { cn } from "@/lib/utils/cn";

export function FloatingCategoryDock() {
  const categories = useMenuPageStore((s) => s.categories);
  const activeCategory = useMenuPageStore((s) => s.activeCategory);
  const setActiveCategory = useMenuPageStore((s) => s.setActiveCategory);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeCategory]);

  if (categories.length === 0) return null;

  const pillClass = (active: boolean) =>
    cn(
      "w-full rounded-full px-3 py-1.5 text-left text-xs font-medium transition-all",
      active
        ? "bg-brand-saffron text-white shadow-sm"
        : "bg-brand-cream/80 text-brand-charcoal hover:bg-brand-cream"
    );

  return (
    <div
      className="max-h-44 w-36 overflow-y-auto rounded-2xl border border-brand-gold/40 bg-brand-surface/95 p-1.5 shadow-lg backdrop-blur-md [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label="Menu categories"
    >
      <button
        ref={!activeCategory ? activeRef : undefined}
        type="button"
        role="tab"
        aria-selected={!activeCategory}
        onClick={() => setActiveCategory(null)}
        className={pillClass(!activeCategory)}
      >
        All
      </button>
      {categories.map((cat) => {
        const active = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            ref={active ? activeRef : undefined}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(pillClass(active), "mt-1 truncate")}
            title={cat.name}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
