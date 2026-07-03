import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-brand-saffron/15 text-brand-turmeric",
        success: "bg-brand-leaf/15 text-brand-leaf",
        warning: "bg-brand-gold/25 text-brand-clay",
        destructive: "bg-red-100 text-red-800",
        secondary: "bg-brand-leaf/15 text-brand-leaf",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
