import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: "up" | "down" | null;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend = null,
}: StatsCardProps) {
  return (
    <Card className="card-hover">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-brand-muted">{title}</CardTitle>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-saffron/12 text-brand-saffron">
          <Icon className="h-4 w-4" />
        </span>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1.5">
          <span className="text-4xl font-bold text-brand-leaf">{value}</span>
          {trend === "up" && (
            <span className="text-sm font-semibold text-brand-leaf" aria-label="Trending up">
              ▲
            </span>
          )}
          {trend === "down" && (
            <span className="text-sm font-semibold text-red-600" aria-label="Trending down">
              ▼
            </span>
          )}
        </div>
        {description && (
          <p className={cn("mt-1 text-xs text-brand-muted")}>{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
