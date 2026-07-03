import Link from "next/link";
import type { MenuItem } from "@/lib/api/types";
import { MenuCard } from "./MenuCard";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

interface TodaysSpecialsProps {
  items: MenuItem[];
}

export function TodaysSpecials({ items }: TodaysSpecialsProps) {
  if (items.length === 0) return null;

  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="label-tag">✦ TODAY&apos;S KITCHEN</p>
            <h2 className="mt-2 font-[family-name:var(--font-playfair)] text-3xl font-bold text-brand-charcoal md:text-4xl">
              What&apos;s Fresh Today
            </h2>
            <p className="mt-1 text-sm text-brand-muted">
              Handpicked from the kitchen every morning
            </p>
          </div>
          <Button asChild variant="outline" className="shrink-0">
            <Link href="/menu">View all</Link>
          </Button>
        </div>

        {/* Horizontal scroll row with "Today Only" ribbon */}
        <Reveal className="mt-8">
          <div className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {items.map((item) => (
              <div key={item.id} className="relative w-64 shrink-0 snap-start sm:w-72">
                {/* "Today Only" ribbon */}
                <span className="absolute -top-2 left-3 z-10 rounded-full bg-brand-leaf px-3 py-0.5 font-hand text-xs font-normal text-white shadow-sm">
                  Today Only
                </span>
                <MenuCard item={item} />
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
