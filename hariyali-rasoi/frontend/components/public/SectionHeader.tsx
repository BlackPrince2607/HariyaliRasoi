import { cn } from "@/lib/utils/cn";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
  eyebrowClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
  eyebrowClassName,
  titleClassName,
  subtitleClassName,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            "font-hand text-xl text-brand-saffron",
            align === "center" && "flex items-center justify-center gap-2",
            eyebrowClassName
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          "mt-1 font-[family-name:var(--font-playfair)] text-3xl font-bold tracking-tight text-brand-charcoal md:text-4xl",
          titleClassName
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={cn("mt-3 text-base leading-relaxed text-brand-muted", subtitleClassName)}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
