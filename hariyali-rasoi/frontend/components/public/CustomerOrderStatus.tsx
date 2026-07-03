"use client";

import { Clock, CheckCircle, XCircle, ChefHat, Package, Truck } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const STATUS_CONFIG: Record<
  string,
  { label: string; message: string; icon: typeof Clock; tone: string }
> = {
  pending: {
    label: "Awaiting confirmation",
    message:
      "We received your order. The kitchen will confirm shortly — you'll see the status update here automatically.",
    icon: Clock,
    tone: "border-amber-300/60 bg-amber-50 text-amber-900",
  },
  accepted: {
    label: "Order confirmed",
    message: "The kitchen has accepted your order and will start preparing it soon.",
    icon: CheckCircle,
    tone: "border-brand-leaf/40 bg-brand-leaf/10 text-brand-charcoal",
  },
  preparing: {
    label: "Preparing your meal",
    message: "Your homestyle meal is being prepared right now.",
    icon: ChefHat,
    tone: "border-brand-saffron/40 bg-brand-saffron/10 text-brand-charcoal",
  },
  ready: {
    label: "Ready for delivery",
    message: "Your order is packed and ready to head out.",
    icon: Package,
    tone: "border-brand-leaf/40 bg-brand-leaf/10 text-brand-charcoal",
  },
  delivered: {
    label: "Delivered",
    message: "Enjoy your meal! Thank you for ordering from Hariyali Rasoi.",
    icon: Truck,
    tone: "border-brand-leaf/40 bg-brand-leaf/10 text-brand-charcoal",
  },
  rejected: {
    label: "Order not accepted",
    message:
      "Sorry, we could not accept this order. Please contact us on WhatsApp if you have questions or would like to reorder.",
    icon: XCircle,
    tone: "border-red-300/70 bg-red-50 text-red-900",
  },
};

export function CustomerOrderStatus({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const Icon = config.icon;

  return (
    <div className={cn("rounded-2xl border p-4", config.tone)}>
      <div className="flex items-center gap-2 font-semibold">
        <Icon className="h-5 w-5 shrink-0" />
        {config.label}
      </div>
      <p className="mt-2 text-sm leading-relaxed opacity-90">{config.message}</p>
    </div>
  );
}
