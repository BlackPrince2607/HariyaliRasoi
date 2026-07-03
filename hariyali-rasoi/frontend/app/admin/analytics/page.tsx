"use client";

import { useEffect, useState } from "react";
import { getAnalyticsOverview, getRevenueAnalytics, getTopItems } from "@/lib/api/admin";
import type { AnalyticsOverview, RevenueDataPoint, TopItem } from "@/lib/api/types";
import { StatsCard } from "@/components/admin/StatsCard";
import { RevenueChart, TopItemsChart } from "@/components/admin/AnalyticsChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, IndianRupee, Clock, UtensilsCrossed } from "lucide-react";
import { formatPrice } from "@/lib/utils/price";

export default function AdminAnalyticsPage() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [revenue, setRevenue] = useState<RevenueDataPoint[]>([]);
  const [topItems, setTopItems] = useState<TopItem[]>([]);

  useEffect(() => {
    getAnalyticsOverview().then(setOverview).catch(() => {});
    getRevenueAnalytics().then(setRevenue).catch(() => {});
    getTopItems().then(setTopItems).catch(() => {});
  }, []);

  return (
    <div>
      <p className="font-hand text-xl text-brand-saffron">how we&apos;re doing</p>
      <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-brand-charcoal md:text-3xl">Analytics</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Orders Today" value={overview?.orders_today ?? "—"} icon={ShoppingBag} />
        <StatsCard title="Revenue Today" value={overview ? formatPrice(overview.revenue_today) : "—"} icon={IndianRupee} />
        <StatsCard title="Pending" value={overview?.pending_orders ?? "—"} icon={Clock} />
        <StatsCard title="Menu Items" value={overview?.total_items ?? "—"} icon={UtensilsCrossed} />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Revenue (30 days)</CardTitle></CardHeader>
          <CardContent><RevenueChart data={revenue} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Top Items</CardTitle></CardHeader>
          <CardContent><TopItemsChart data={topItems} /></CardContent>
        </Card>
      </div>
    </div>
  );
}
