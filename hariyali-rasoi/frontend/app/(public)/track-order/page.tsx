"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { lookupOrder } from "@/lib/api/orders";
import type { Order } from "@/lib/api/types";
import { CustomerOrderStatus } from "@/components/public/CustomerOrderStatus";
import { WhatsAppOrderButton } from "@/components/public/WhatsAppOrderButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/utils/price";

const LAST_ORDER_PHONE_KEY = "last_order_phone";
const POLL_MS = 20_000;

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const presetOrder = searchParams.get("order") ?? "";
  const [orderNumber, setOrderNumber] = useState(presetOrder);
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(LAST_ORDER_PHONE_KEY);
    if (stored) setPhone(stored);
  }, []);

  const load = async (num: string, ph: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await lookupOrder(num.trim(), ph.trim());
      setOrder(result);
      sessionStorage.setItem(LAST_ORDER_PHONE_KEY, ph.trim());
    } catch {
      setOrder(null);
      setError("Order not found. Check your order number and phone number.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (presetOrder && phone) {
      void load(presetOrder, phone);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetOrder, phone]);

  useEffect(() => {
    if (!order || order.status !== "pending") return;
    const timer = setInterval(() => {
      void load(order.order_number, phone);
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [order, phone]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !phone.trim()) return;
    void load(orderNumber, phone);
  };

  return (
    <div className="px-4 py-12">
      <div className="mx-auto max-w-md">
        <p className="font-hand text-xl text-brand-saffron">where&apos;s my thali?</p>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-brand-charcoal">
          Track Order
        </h1>
        <p className="mt-1 text-sm text-brand-muted">
          Enter your order number and phone to see if the kitchen has accepted your order.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border border-brand-gold/35 bg-brand-surface p-5 shadow-[var(--shadow-card)]">
          <div>
            <Label htmlFor="order_number">Order number</Label>
            <Input
              id="order_number"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="HR-20260609-0001"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit mobile number"
              className="mt-1"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Checking…" : "Check status"}
          </Button>
        </form>

        {error && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}

        {order && (
          <div className="mt-6 space-y-4">
            <CustomerOrderStatus status={order.status} />
            <div className="rounded-2xl border border-brand-gold/35 bg-brand-surface p-5 shadow-[var(--shadow-card)]">
              <p className="font-semibold text-brand-charcoal">{order.order_number}</p>
              <p className="mt-1 text-sm text-brand-muted">{order.customer_name}</p>
              <p className="mt-2 text-lg font-bold text-brand-leaf">{formatPrice(order.total)}</p>
              <div className="mt-4">
                <WhatsAppOrderButton order={order} />
              </div>
            </div>
            {order.status === "pending" && (
              <p className="text-center text-xs text-brand-muted">
                Checking for updates every 20 seconds…
              </p>
            )}
          </div>
        )}

        <Button asChild variant="ghost" className="mt-6 w-full">
          <Link href="/menu">Back to menu</Link>
        </Button>
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-brand-muted">Loading…</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
