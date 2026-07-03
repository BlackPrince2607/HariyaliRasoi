import { cn } from "@/lib/utils/cn";

/** Hand-drawn tulsi/leaf sprig — used on dividers, empty states, placeholders. */
export function LeafMotif({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={cn("h-8 w-8", className)} aria-hidden="true">
      <path
        d="M32 58C32 38 18 30 8 28c0 18 12 28 24 30Z"
        fill="currentColor"
        opacity="0.85"
      />
      <path
        d="M32 58C32 38 46 30 56 28c0 18-12 28-24 30Z"
        fill="currentColor"
        opacity="0.55"
      />
      <path d="M32 60V18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path
        d="M32 18c0-6 4-10 8-12-1 6-3 10-8 12Z"
        fill="currentColor"
        opacity="0.7"
      />
    </svg>
  );
}

/** Lotus motif for section dividers / empty states. */
export function LotusMotif({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 64" fill="none" className={cn("h-10 w-12", className)} aria-hidden="true">
      <path d="M40 56C40 40 40 30 40 22c8 8 12 22 0 34Z" fill="currentColor" opacity="0.5" />
      <path d="M40 56C40 40 40 30 40 22c-8 8-12 22 0 34Z" fill="currentColor" opacity="0.5" />
      <path d="M40 56C30 44 22 40 14 40c2 12 14 18 26 16Z" fill="currentColor" opacity="0.7" />
      <path d="M40 56c10-12 18-16 26-16-2 12-14 18-26 16Z" fill="currentColor" opacity="0.7" />
      <path d="M40 56C26 50 16 52 8 56c10 8 24 6 32 0Z" fill="currentColor" opacity="0.9" />
      <path d="M40 56c14-6 24-4 32 0-10 8-24 6-32 0Z" fill="currentColor" opacity="0.9" />
    </svg>
  );
}

/** Clay pot / handi motif for empty states. */
export function PotMotif({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={cn("h-12 w-12", className)} aria-hidden="true">
      <path
        d="M20 18h24c-1 3-3 5-3 5 8 3 13 11 13 19 0 11-10 18-22 18S10 53 10 42c0-8 5-16 13-19 0 0-2-2-3-5Z"
        fill="currentColor"
        opacity="0.85"
      />
      <path d="M16 28h32" stroke="#FFF8F0" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <path d="M24 14c2-3 14-3 16 0" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Decorative section divider with a centered leaf sprig. */
export function SectionDivider({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-3 py-2 text-brand-gold", className)}>
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-brand-gold/60" />
      <LeafMotif className="h-6 w-6 text-brand-leaf/70" />
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-brand-gold/60" />
    </div>
  );
}
