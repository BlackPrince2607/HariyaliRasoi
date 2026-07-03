"use client";

import { useEffect, useState } from "react";
import { getCoupons, createCoupon, deleteCoupon } from "@/lib/api/admin";
import type { Coupon } from "@/lib/api/types";
import { CouponForm } from "@/components/admin/CouponForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [creating, setCreating] = useState(false);

  const refresh = () => getCoupons().then(setCoupons).catch(() => {});
  useEffect(() => { refresh(); }, []);

  const handleCreate = async (data: Partial<Coupon>) => {
    try {
      await createCoupon(data);
      setCreating(false);
      refresh();
      toast.success("Coupon created");
    } catch {
      toast.error("Failed to create coupon");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-brand-charcoal md:text-3xl">Coupons</h1>
        <Button onClick={() => setCreating(true)}>Add Coupon</Button>
      </div>
      {creating && (
        <div className="mt-6 rounded-2xl border border-brand-gold/35 bg-brand-surface p-6 shadow-[var(--shadow-card)]">
          <CouponForm onSubmit={handleCreate} onCancel={() => setCreating(false)} />
        </div>
      )}
      <div className="mt-6 space-y-2">
        {coupons.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-xl border border-brand-gold/35 bg-brand-surface p-4 shadow-[var(--shadow-card)]">
            <div>
              <span className="font-mono font-bold text-brand-charcoal">{c.code}</span>
              <Badge className="ml-2">{c.type === "percentage" ? `${c.value}%` : `₹${c.value}`}</Badge>
              <p className="text-sm text-brand-muted">Used: {c.used_count}{c.max_uses ? `/${c.max_uses}` : ""}</p>
            </div>
            <Button size="sm" variant="destructive" onClick={async () => { await deleteCoupon(c.id); refresh(); }}>Delete</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
