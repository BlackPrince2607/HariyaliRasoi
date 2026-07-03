import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LeafMotif } from "@/components/ui/motifs";
import { DishImage } from "@/components/ui/dish-image";

const stats = [
  { value: "121+", label: "Homestyle dishes" },
  { value: "16", label: "Menu categories" },
  { value: "100%", label: "Vegetarian kitchen" },
];

const trustPills = [
  "🌿 100% Veg Options",
  "🏠 Home Cooked",
  "⚡ Fast Delivery",
];

export function Hero() {
  return (
    <section className="relative overflow-hidden mesh-warm min-h-[calc(100svh-4rem)] flex items-center px-4 py-16 md:py-20">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -right-24 top-8 h-96 w-96 rounded-full bg-brand-saffron/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-brand-leaf/10 blur-3xl" />

      <div className="relative mx-auto w-full max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">

          {/* ── Left column ─────────────────────────────────────────── */}
          <div className="animate-fade-in">
            {/* Label tag */}
            <p className="label-tag">Est. 2018 · Home Kitchen</p>

            {/* Display headline */}
            <h1
              className="mt-4 font-[family-name:var(--font-playfair)] font-bold leading-[1.05] tracking-tight text-brand-charcoal"
              style={{ fontSize: "var(--text-display)" }}
            >
              Ghar ka{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "var(--gradient-saffron)" }}
              >
                khana,
              </span>
              <br />
              <span className="font-hand font-normal text-brand-charcoal" style={{ fontSize: "0.7em" }}>
                delivered fresh.
              </span>
            </h1>

            {/* Subtext */}
            <p className="mt-5 max-w-md text-lg leading-relaxed text-brand-muted">
              From morning dosas to festive thalis — homestyle food cooked fresh daily,
              or catered for bhandara, events & community meals.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-white shadow-[var(--shadow-elevated)] transition-all duration-200 hover:brightness-110 hover:scale-[1.02] [background:var(--gradient-saffron)]"
              >
                Order Now
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/events"
                className="inline-flex items-center rounded-full border border-brand-gold/60 bg-brand-surface px-8 py-4 text-base font-semibold text-brand-charcoal transition-all duration-200 hover:bg-brand-cream hover:scale-[1.02]"
              >
                Book Catering
              </Link>
            </div>

            {/* Trust pills */}
            <div className="mt-5 flex flex-wrap items-center gap-1 text-xs text-brand-muted">
              {trustPills.map((pill, i) => (
                <span key={pill} className="flex items-center gap-1">
                  {i > 0 && <span className="text-brand-gold/60">·</span>}
                  {pill}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-brand-gold/30 pt-8">
              {stats.map((s) => (
                <div key={s.label}>
                  <p
                    className="font-[family-name:var(--font-playfair)] font-bold text-brand-leaf"
                    style={{ fontSize: "var(--text-hero)" }}
                  >
                    {s.value}
                  </p>
                  <p className="mt-0.5 text-xs text-brand-muted md:text-sm">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right column (desktop) ───────────────────────────────── */}
          <div className="relative hidden items-center justify-center lg:flex">
            {/* Background leaf motif */}
            <LeafMotif className="absolute h-[28rem] w-[28rem] -rotate-12 scale-150 text-brand-leaf opacity-[0.07] pointer-events-none" />

            {/* Organic blob image frame */}
            <div
              className="relative w-full max-w-md aspect-square overflow-hidden animate-float"
              style={{ borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" }}
            >
              <DishImage
                src={null}
                alt="Hariyali Rasoi food"
                fallbackEmoji="🍛"
                className="h-full w-full object-cover"
              />
            </div>

            {/* Floating badge */}
            <div className="card-warm absolute -bottom-2 left-4 rounded-2xl px-4 py-3 shadow-[var(--shadow-elevated)]">
              <p className="font-hand text-lg text-brand-saffron">121+ Dishes 🌿</p>
              <p className="text-xs text-brand-muted">fresh every day</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
