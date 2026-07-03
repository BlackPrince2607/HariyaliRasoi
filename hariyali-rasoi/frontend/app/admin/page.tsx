"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, IndianRupee, Clock, UtensilsCrossed } from "lucide-react";
import { getAnalyticsOverview } from "@/lib/api/admin";
import { getOrders } from "@/lib/api/orders";
import type { AnalyticsOverview, Order } from "@/lib/api/types";
import { StatsCard } from "@/components/admin/StatsCard";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { StoreToggle } from "@/components/admin/StoreToggle";
import { getStoreSettings } from "@/lib/api/admin";
import { formatPrice } from "@/lib/utils/price";

export default function AdminDashboard() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isOpen, setIsOpen] = useState(true);

  const refresh = () => {
    getAnalyticsOverview().then(setOverview).catch(() => {});
    getOrders("pending").then(setOrders).catch(() => {});
    getStoreSettings().then((s) => setIsOpen(s.is_open)).catch(() => {});
  };

  useEffect(() => { refresh(); }, []);

  return (
    <div>
      <p className="font-hand text-xl text-brand-saffron">namaste, chef</p>
      <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-brand-charcoal md:text-3xl">
        Dashboard
      </h1>
      <p className="text-sm text-brand-muted">Welcome to your Hariyali Rasoi kitchen</p>

      <div className="mt-6">
        <StoreToggle isOpen={isOpen} onToggle={setIsOpen} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Orders Today" value={overview?.orders_today ?? "—"} icon={ShoppingBag} />
        <StatsCard title="Revenue Today" value={overview ? formatPrice(overview.revenue_today) : "—"} icon={IndianRupee} />
        <StatsCard title="Pending Orders" value={overview?.pending_orders ?? "—"} icon={Clock} />
        <StatsCard title="Menu Items" value={overview?.total_items ?? "—"} icon={UtensilsCrossed} />
      </div>

      <div className="mt-8">
        <h2 className="mb-4 font-[family-name:var(--font-playfair)] text-lg font-bold text-brand-charcoal">
          Pending Orders
        </h2>
        <OrdersTable orders={orders} onRefresh={refresh} />
      </div>
    </div>
  );
}
