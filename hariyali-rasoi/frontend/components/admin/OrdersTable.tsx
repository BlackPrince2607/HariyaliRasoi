"use client";

import { useState } from "react";
import type { Order } from "@/lib/api/types";
import { updateOrderStatus, verifyPayment } from "@/lib/api/orders";
import { formatPrice } from "@/lib/utils/price";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";
import { useOrderAlerts } from "@/lib/hooks/useOrderAlerts";
import {
  buildCustomerStatusMessage,
  buildWhatsAppToCustomer,
} from "@/lib/utils/whatsapp";
import { openWhatsApp } from "@/lib/utils/openWhatsApp";

const STATUSES = ["pending", "accepted", "preparing", "ready", "delivered", "rejected"];

interface OrdersTableProps {
  orders: Order[];
  onRefresh: () => void;
}

export function OrdersTable({ orders, onRefresh }: OrdersTableProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const { dismissOrder } = useOrderAlerts();

  const notifyCustomer = (order: Order, status: "accepted" | "rejected") => {
    const href = buildWhatsAppToCustomer(
      order,
      buildCustomerStatusMessage(order, status)
    );
    if (href) openWhatsApp(href);
  };

  const handleStatusChange = async (orderId: string, status: string) => {
    const order = orders.find((o) => o.id === orderId);
    try {
      await updateOrderStatus(orderId, status);
      if (status === "accepted" || status === "rejected") {
        dismissOrder(orderId);
        if (order) notifyCustomer(order, status as "accepted" | "rejected");
      }
      toast.success("Status updated");
      onRefresh();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleVerifyPayment = async (orderId: string) => {
    try {
      await verifyPayment(orderId);
      toast.success("Payment verified");
      onRefresh();
    } catch {
      toast.error("Failed to verify payment");
    }
  };

  if (orders.length === 0) {
    return (
      <EmptyState
        motif="pot"
        title="No orders here"
        description="Orders matching the current filters will appear here as they come in."
      />
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div
          key={order.id}
          className="rounded-2xl border border-brand-gold/35 bg-brand-surface p-4 shadow-[var(--shadow-card)]"
        >
          <div
            className="flex cursor-pointer flex-wrap items-center justify-between gap-2"
            onClick={() => setExpanded(expanded === order.id ? null : order.id)}
          >
            <div>
              <p className="font-semibold text-brand-charcoal">{order.order_number}</p>
              <p className="text-sm text-brand-muted">
                {order.customer_name} · {order.customer_phone}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <OrderStatusBadge status={order.status} />
              <span className="font-bold text-brand-leaf">{formatPrice(order.total)}</span>
            </div>
          </div>

          {expanded === order.id && (
            <div className="mt-4 space-y-3 border-t border-brand-gold/30 pt-4 text-brand-charcoal/85">
              <p className="text-sm"><strong>Address:</strong> {order.delivery_address}</p>
              <ul className="text-sm space-y-1">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.name} x{item.quantity} — {formatPrice(item.subtotal)}
                  </li>
                ))}
              </ul>
              <p className="text-sm">
                Payment: {order.payment_method.toUpperCase()} — {order.payment_status}
              </p>
              {order.payment_screenshot_url && (
                <a href={order.payment_screenshot_url} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-leaf underline">
                  View payment screenshot
                </a>
              )}
              <div className="flex flex-wrap gap-2">
                {order.status === "pending" && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(order.id, "accepted")}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                      onClick={() => handleStatusChange(order.id, "rejected")}
                    >
                      Reject
                    </Button>
                  </>
                )}
                <Select onValueChange={(v) => handleStatusChange(order.id, v)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Update status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {order.payment_method === "upi" && order.payment_status === "pending" && (
                  <Button size="sm" variant="secondary" onClick={() => handleVerifyPayment(order.id)}>
                    Verify Payment
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
