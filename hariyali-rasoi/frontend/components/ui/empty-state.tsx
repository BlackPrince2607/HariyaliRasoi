import { LeafMotif, PotMotif, LotusMotif } from "@/components/ui/motifs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type Motif = "leaf" | "pot" | "lotus";

const motifs = {
  leaf: LeafMotif,
  pot: PotMotif,
  lotus: LotusMotif,
};

interface EmptyStateProps {
  title: string;
  description?: string;
  motif?: Motif;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  motif = "leaf",
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  const Motif = motifs[motif];
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-gold/50 bg-brand-surface/60 px-6 py-14 text-center",
        className
      )}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-leaf/10 text-brand-leaf">
        <Motif className="h-10 w-10" />
      </div>
      <h3 className="mt-5 font-[family-name:var(--font-playfair)] text-xl font-bold text-brand-charcoal">
        {title}
      </h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-brand-muted">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline" className="mt-5">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
