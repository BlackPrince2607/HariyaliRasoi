"use client";

import { MessageCircle, VolumeX, X } from "lucide-react";
import { toast } from "sonner";
import { useOrderAlerts } from "@/lib/hooks/useOrderAlerts";
import { formatPrice } from "@/lib/utils/price";
import {
  buildCustomerStatusMessage,
  buildOrderSummaryText,
  buildWhatsAppShareLink,
  buildWhatsAppToCustomer,
} from "@/lib/utils/whatsapp";
import { openWhatsApp } from "@/lib/utils/openWhatsApp";
import { Button } from "@/components/ui/button";

export function OrderAlertPanel() {
  const {
    alertOrders,
    soundEnabled,
    acceptOrder,
    rejectOrder,
    dismissOrder,
    stopSound,
  } = useOrderAlerts();

  if (alertOrders.length === 0) return null;

  const handleAccept = async (order: (typeof alertOrders)[0]) => {
    try {
      await acceptOrder(order.id);
      const href = buildWhatsAppToCustomer(
        order,
        buildCustomerStatusMessage(order, "accepted")
      );
      if (href) openWhatsApp(href);
      toast.success("Order accepted — WhatsApp opened to notify customer");
    } catch {
      toast.error("Failed to accept order");
    }
  };

  const handleReject = async (order: (typeof alertOrders)[0]) => {
    try {
      await rejectOrder(order.id);
      const href = buildWhatsAppToCustomer(
        order,
        buildCustomerStatusMessage(order, "rejected")
      );
      if (href) openWhatsApp(href);
      toast.success("Order rejected — WhatsApp opened to notify customer");
    } catch {
      toast.error("Failed to reject order");
    }
  };

  return (
    <div className="fixed inset-x-0 top-0 z-[100] space-y-2 p-3 md:left-16 md:p-4 lg:left-64">
      {alertOrders.map((order) => (
        <div
          key={order.id}
          className="mx-auto max-w-3xl rounded-2xl border-2 border-brand-saffron bg-brand-surface p-4 shadow-xl ring-4 ring-brand-saffron/25"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-hand text-lg text-brand-saffron">new order!</p>
              <p className="font-semibold text-brand-charcoal">
                {order.order_number} · {order.customer_name}
              </p>
              <p className="text-sm text-brand-muted">
                {order.customer_phone} · {formatPrice(order.total)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {soundEnabled && (
                <Button size="sm" variant="outline" onClick={stopSound} title="Stop alarm">
                  <VolumeX className="h-4 w-4" />
                  Stop sound
                </Button>
              )}
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  const link = buildWhatsAppShareLink(buildOrderSummaryText(order));
                  if (link) window.open(link, "_blank", "noopener,noreferrer");
                }}
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>
              <Button size="sm" onClick={() => handleAccept(order)}>
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
                onClick={() => handleReject(order)}
              >
                Reject
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => dismissOrder(order.id)}
                title="Dismiss alert (order stays pending)"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
