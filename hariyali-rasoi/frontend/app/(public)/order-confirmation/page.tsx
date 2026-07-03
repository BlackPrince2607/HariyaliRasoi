"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import type { Order } from "@/lib/api/types";
import { lookupOrder } from "@/lib/api/orders";
import { formatPrice } from "@/lib/utils/price";
import { WhatsAppOrderButton } from "@/components/public/WhatsAppOrderButton";
import { CustomerOrderStatus } from "@/components/public/CustomerOrderStatus";
import { Button } from "@/components/ui/button";
import { buildWhatsAppMessage, resolveWhatsappNumber } from "@/lib/utils/whatsapp";
import { openWhatsApp } from "@/lib/utils/openWhatsApp";
import { useStore } from "@/lib/hooks/useStore";

const LAST_ORDER_KEY = "last_order";
const LAST_ORDER_PHONE_KEY = "last_order_phone";
const POLL_MS = 20_000;
const TERMINAL_STATUSES = new Set(["accepted", "preparing", "ready", "delivered", "rejected"]);

async function fetchOrder(orderNumber: string, phone: string): Promise<Order | null> {
  try {
    return await lookupOrder(orderNumber, phone);
  } catch {
    return null;
  }
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [whatsappOpened, setWhatsappOpened] = useState(false);
  const { settings } = useStore();

  const refreshOrder = useCallback(async () => {
    if (!orderNumber) return null;
    const phone = sessionStorage.getItem(LAST_ORDER_PHONE_KEY);
    if (!phone) return null;
    const fetched = await fetchOrder(orderNumber, phone);
    if (fetched) {
      setOrder(fetched);
      sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(fetched));
    }
    return fetched;
  }, [orderNumber]);

  useEffect(() => {
    let cancelled = false;

    async function loadOrder() {
      if (!orderNumber) {
        setError("Missing order number.");
        setLoading(false);
        return;
      }

      const phone = sessionStorage.getItem(LAST_ORDER_PHONE_KEY);
      if (!phone) {
        setError("We could not load this order. Please use the track order page.");
        setLoading(false);
        return;
      }

      const fetched = await fetchOrder(orderNumber, phone);
      if (cancelled) return;

      if (fetched) {
        setOrder(fetched);
      } else {
        setError("Order not found. Please confirm your order number and try again.");
      }
      setLoading(false);
    }

    void loadOrder();
    return () => {
      cancelled = true;
    };
  }, [orderNumber]);

  useEffect(() => {
    if (!order || whatsappOpened) return;
    const key = `wa_notified_${order.id}`;
    if (sessionStorage.getItem(key)) {
      setWhatsappOpened(true);
      return;
    }

    const number = resolveWhatsappNumber(
      settings?.whatsapp,
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
    );
    const href = buildWhatsAppMessage(order, number);
    if (!href) return;

    sessionStorage.setItem(key, "1");
    setWhatsappOpened(true);
    openWhatsApp(href);
  }, [order, settings?.whatsapp, whatsappOpened]);

  useEffect(() => {
    if (!order || TERMINAL_STATUSES.has(order.status)) return;

    const timer = setInterval(() => {
      void refreshOrder();
    }, POLL_MS);

    return () => clearInterval(timer);
  }, [order, refreshOrder]);

  if (loading) {
    return (
      <div className="px-4 py-16 text-center text-brand-muted">
        Loading your order…
      </div>
    );
  }

  const isPending = order?.status === "pending";
  const isRejected = order?.status === "rejected";

  return (
    <div className="px-4 py-16">
      <div className="mx-auto max-w-lg text-center">
        <div
          className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
            isRejected ? "bg-red-100" : "bg-brand-leaf/12"
          }`}
        >
          <CheckCircle
            className={`h-12 w-12 ${isRejected ? "text-red-500" : "text-brand-leaf"}`}
          />
        </div>
        <p className="mt-5 font-hand text-2xl text-brand-saffron">dhanyavaad!</p>
        <h1 className="mt-1 font-[family-name:var(--font-playfair)] text-3xl font-bold text-brand-charcoal md:text-4xl">
          {isRejected ? "Order Update" : "Order Received!"}
        </h1>
        <p className="mt-2 text-brand-muted">
          {isPending
            ? "Your order has been submitted and is waiting for kitchen confirmation."
            : isRejected
              ? "Unfortunately this order could not be accepted."
              : "Thank you for ordering from Hariyali Rasoi."}
        </p>
        {orderNumber && (
          <p className="mt-2 text-brand-charcoal/70">
            Order number: <strong className="text-brand-saffron">{orderNumber}</strong>
          </p>
        )}
        {error && (
          <p className="mt-4 rounded-xl border border-brand-gold/35 bg-brand-cream/60 px-4 py-3 text-sm text-brand-charcoal/80">
            {error}
          </p>
        )}
        {order && (
          <div className="mt-6 space-y-4 text-left">
            <CustomerOrderStatus status={order.status} />
            <div className="rounded-2xl border border-brand-gold/35 bg-brand-surface p-6 shadow-[var(--shadow-card)]">
              <p className="text-sm text-brand-muted">Order total</p>
              <p className="text-2xl font-bold text-brand-leaf">{formatPrice(order.total)}</p>
              <p className="mt-2 text-sm text-brand-charcoal/80">
                Payment: {order.payment_method === "upi" ? "UPI" : "Cash on Delivery"}
              </p>
              {isPending && (
                <p className="mt-4 text-sm text-brand-muted">
                  Opening WhatsApp so you can send this order to the kitchen. Tap{" "}
                  <strong>Send</strong> in WhatsApp — confirmation is not complete until the
                  kitchen accepts.
                </p>
              )}
              <div className="mt-3 space-y-2">
                <WhatsAppOrderButton order={order} />
              </div>
            </div>
            {isPending && (
              <p className="text-center text-xs text-brand-muted">
                This page updates automatically when the kitchen accepts or declines your order.
              </p>
            )}
          </div>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {orderNumber && (
            <Button asChild variant="outline">
              <Link href={`/track-order?order=${encodeURIComponent(orderNumber)}`}>
                Track Order
              </Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link href="/menu">Order More</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-brand-muted">Loading…</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
