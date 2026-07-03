"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import type { Review } from "@/lib/api/types";
import { SectionDivider } from "@/components/ui/motifs";
import { cn } from "@/lib/utils/cn";

interface ReviewsCarouselProps {
  reviews: Review[];
}

export function ReviewsCarousel({ reviews }: ReviewsCarouselProps) {
  const [index, setIndex] = useState(0);
  const count = reviews.length;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback(
    (next: number) => setIndex((prev) => (count ? (next + count) % count : 0)),
    [count]
  );

  const startTimer = useCallback(() => {
    if (count <= 1) return;
    timerRef.current = setInterval(() => setIndex((i) => (i + 1) % count), 6000);
  }, [count]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    startTimer();
    return stopTimer;
  }, [startTimer, stopTimer]);

  if (count === 0) return null;
  const review = reviews[index];

  return (
    <section className="bg-brand-cream px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-hand text-xl text-brand-saffron">from our guests</p>
        <h2 className="mt-1 font-[family-name:var(--font-playfair)] text-3xl font-bold text-brand-charcoal md:text-4xl">
          What our customers say
        </h2>
        <SectionDivider className="mt-3" />

        {/* Carousel — hover pauses autoplay */}
        <div
          className="relative mt-6 min-h-[16rem]"
          onMouseEnter={stopTimer}
          onMouseLeave={startTimer}
        >
          <div
            key={review.id}
            className="animate-fade-in relative rounded-3xl border border-brand-gold/35 bg-brand-surface p-8 shadow-[var(--shadow-warm)]"
          >
            {/* Large decorative quote mark */}
            <span className="pointer-events-none absolute -top-4 left-4 select-none font-[family-name:var(--font-playfair)] text-8xl leading-none text-brand-gold/20">
              &ldquo;
            </span>

            {/* Stars */}
            <div className="flex justify-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-5 w-5",
                    i < review.rating ? "fill-brand-saffron text-brand-saffron" : "text-brand-gold/30"
                  )}
                />
              ))}
            </div>

            <p className="mt-4 text-lg italic leading-relaxed text-brand-charcoal/85">
              &ldquo;{review.review}&rdquo;
            </p>
            <p className="mt-4 font-hand text-xl text-brand-leaf">— {review.customer_name}</p>
          </div>
        </div>

        {count > 1 && (
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={() => go(index - 1)}
              aria-label="Previous review"
              className="rounded-full border border-brand-gold/40 bg-brand-surface p-2 text-brand-charcoal transition hover:bg-brand-cream"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-2">
              {reviews.map((r, i) => (
                <button
                  key={r.id}
                  onClick={() => setIndex(i)}
                  aria-label={`Review ${i + 1}`}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i === index ? "w-6 bg-brand-saffron" : "w-2 bg-brand-gold/40"
                  )}
                />
              ))}
            </div>
            <button
              onClick={() => go(index + 1)}
              aria-label="Next review"
              className="rounded-full border border-brand-gold/40 bg-brand-surface p-2 text-brand-charcoal transition hover:bg-brand-cream"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
