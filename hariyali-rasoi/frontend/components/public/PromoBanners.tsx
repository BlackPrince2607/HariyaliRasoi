"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Banner } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

interface PromoBannersProps {
  banners: Banner[];
}

export function PromoBanners({ banners }: PromoBannersProps) {
  const [active, setActive] = useState(0);
  const count = banners.length;

  const go = useCallback(
    (next: number) => setActive((prev) => (count ? (next + count) % count : 0)),
    [count]
  );

  useEffect(() => {
    if (count <= 1) return;
    const timer = setInterval(() => setActive((p) => (p + 1) % count), 4000);
    return () => clearInterval(timer);
  }, [count]);

  /* ── Default branded panel when no banners exist ────────────────── */
  if (count === 0) {
    return (
      <section className="px-4 py-6">
        <div className="relative mx-auto flex max-w-6xl items-center justify-center overflow-hidden rounded-3xl border border-brand-gold/40 shadow-[var(--shadow-warm)]">
          <div className="mesh-warm flex h-48 w-full flex-col items-center justify-center gap-3 md:h-64">
            <h3
              className="font-[family-name:var(--font-playfair)] font-bold text-brand-charcoal"
              style={{ fontSize: "var(--text-hero)" }}
            >
              Hariyali Rasoi
            </h3>
            <p className="font-hand text-lg text-brand-saffron">
              ghar ka khana, with love 🌿
            </p>
            <Link
              href="/menu"
              className="mt-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white [background:var(--gradient-saffron)] transition-all hover:brightness-110"
            >
              Order Now →
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-6">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-brand-gold/40 shadow-[var(--shadow-warm)]">
        {/* Crossfade slides */}
        <div className="relative h-48 md:h-64">
          {banners.map((banner, i) => {
            const inner = (
              <div className="h-full w-full">
                <Image
                  src={banner.image_url}
                  alt={banner.title || "Promo"}
                  fill
                  priority={i === 0}
                  className="object-cover"
                  sizes="(max-width: 1152px) 100vw, 1152px"
                />
                {(banner.title || banner.subtitle) && (
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-brand-charcoal/70 via-brand-charcoal/20 to-transparent p-6 md:p-10">
                    {banner.title && (
                      <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-white md:text-4xl">
                        {banner.title}
                      </h3>
                    )}
                    {banner.subtitle && (
                      <p className="mt-1 max-w-lg text-sm text-white/85 md:text-base">
                        {banner.subtitle}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
            return (
              <div
                key={banner.id}
                className={cn(
                  "absolute inset-0 transition-opacity duration-700",
                  i === active ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
              >
                {banner.link_url ? <Link href={banner.link_url} className="block h-full">{inner}</Link> : inner}
              </div>
            );
          })}
        </div>

        {count > 1 && (
          <>
            <button
              onClick={() => go(active - 1)}
              aria-label="Previous banner"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-brand-surface/85 p-2 text-brand-charcoal shadow-md backdrop-blur transition hover:bg-brand-surface"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => go(active + 1)}
              aria-label="Next banner"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-brand-surface/85 p-2 text-brand-charcoal shadow-md backdrop-blur transition hover:bg-brand-surface"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Leaf-shaped diamond dots */}
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2.5">
              {banners.map((b, i) => (
                <button
                  key={b.id}
                  onClick={() => setActive(i)}
                  aria-label={`Go to banner ${i + 1}`}
                  className={cn(
                    "h-2.5 w-2.5 rotate-45 rounded-sm transition-all duration-300",
                    i === active
                      ? "scale-125 bg-brand-saffron"
                      : "bg-white/70 hover:bg-white"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
