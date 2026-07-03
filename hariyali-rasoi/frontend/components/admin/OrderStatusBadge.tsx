import { Badge } from "@/components/ui/badge";

const statusVariants: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  pending: "warning",
  accepted: "default",
  preparing: "default",
  ready: "success",
  delivered: "success",
  rejected: "destructive",
};

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={statusVariants[status] || "default"}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
