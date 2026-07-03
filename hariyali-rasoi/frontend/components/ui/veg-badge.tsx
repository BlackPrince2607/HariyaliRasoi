import { cn } from "@/lib/utils/cn";

/** FSSAI-style veg / non-veg mark: a bordered square with a filled dot. */
export function VegBadge({ isVeg, className }: { isVeg: boolean; className?: string }) {
  const color = isVeg ? "#4A7C59" : "#C0392B";
  return (
    <span
      className={cn(
        "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border bg-white",
        className
      )}
      style={{ borderColor: color }}
      title={isVeg ? "Vegetarian" : "Non-vegetarian"}
      aria-label={isVeg ? "Vegetarian" : "Non-vegetarian"}
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
    </span>
  );
}
