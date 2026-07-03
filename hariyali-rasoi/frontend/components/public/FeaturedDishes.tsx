import Link from "next/link";
import type { MenuItem } from "@/lib/api/types";
import { MenuGrid } from "./MenuGrid";
import { SectionHeader } from "./SectionHeader";

interface FeaturedDishesProps {
  items: MenuItem[];
}

export function FeaturedDishes({ items }: FeaturedDishesProps) {
  if (items.length === 0) return null;

  return (
    <section
      className="paper-grain border-y border-brand-gold/30 bg-brand-surface/70 px-4 backdrop-blur"
      style={{ paddingTop: "var(--section-gap)", paddingBottom: "var(--section-gap)" }}
    >
      <div className="mx-auto max-w-6xl">
        {/* Split header: left title, right CTA link */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader
            eyebrow="Bestsellers"
            title="Customer favourites"
            subtitle="Our most-loved homestyle dishes — tried, tested, and ordered again and again."
            align="left"
          />
          <Link
            href="/menu"
            className="label-tag shrink-0 self-start transition-opacity hover:opacity-70 sm:self-auto"
          >
            View Full Menu →
          </Link>
        </div>

        <div className="mt-10">
          <MenuGrid items={items.slice(0, 6)} />
        </div>
      </div>
    </section>
  );
}
