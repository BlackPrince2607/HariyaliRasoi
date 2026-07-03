import * as React from "react";
import { cn } from "@/lib/utils/cn";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-xl border border-brand-gold/40 bg-brand-surface px-3 py-2 text-sm text-brand-charcoal placeholder:text-brand-muted/70 focus-visible:border-brand-saffron/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-saffron/30",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
