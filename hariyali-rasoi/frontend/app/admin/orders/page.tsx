"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { getOrders } from "@/lib/api/orders";
import type { Order } from "@/lib/api/types";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { cn } from "@/lib/utils/cn";

const FILTERS = ["all", "pending", "accepted", "preparing", "ready", "delivered", "rejected"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const refresh = () =>
    getOrders(status === "all" ? undefined : status)
      .then(setOrders)
      .catch(() => {});

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (q) {
        const hay = `${o.order_number} ${o.customer_name} ${o.customer_phone}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (fromDate && new Date(o.created_at) < new Date(fromDate)) return false;
      if (toDate && new Date(o.created_at) > new Date(`${toDate}T23:59:59`)) return false;
      return true;
    });
  }, [orders, search, fromDate, toDate]);

  return (
    <div>
      <p className="font-hand text-xl text-brand-saffron">today&apos;s kitchen</p>
      <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-brand-charcoal md:text-3xl">
        Orders
      </h1>

      <div className="mt-6 space-y-4 rounded-2xl border border-brand-gold/35 bg-brand-surface p-4 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setStatus(f)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition-all",
                status === f
                  ? "bg-brand-saffron text-white shadow-sm"
                  : "bg-brand-cream/80 text-brand-charcoal hover:bg-brand-cream"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
            <input
              type="search"
              placeholder="Search by order #, name or phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-brand-gold/40 bg-brand-cream/40 py-2.5 pl-9 pr-3 text-sm text-brand-charcoal placeholder:text-brand-muted/70 focus:border-brand-saffron/50 focus:outline-none focus:ring-2 focus:ring-brand-saffron/20"
            />
          </div>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            aria-label="From date"
            className="rounded-xl border border-brand-gold/40 bg-brand-cream/40 px-3 py-2.5 text-sm text-brand-charcoal focus:border-brand-saffron/50 focus:outline-none focus:ring-2 focus:ring-brand-saffron/20"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            aria-label="To date"
            className="rounded-xl border border-brand-gold/40 bg-brand-cream/40 px-3 py-2.5 text-sm text-brand-charcoal focus:border-brand-saffron/50 focus:outline-none focus:ring-2 focus:ring-brand-saffron/20"
          />
        </div>
      </div>

      <p className="mt-4 font-hand text-lg text-brand-muted">
        {filtered.length} order{filtered.length !== 1 ? "s" : ""}
      </p>
      <div className="mt-2">
        <OrdersTable orders={filtered} onRefresh={refresh} />
      </div>
    </div>
  );
}
