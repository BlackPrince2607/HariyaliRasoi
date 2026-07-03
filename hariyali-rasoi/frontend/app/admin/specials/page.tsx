"use client";

import { useEffect, useState } from "react";
import { getMenuItems, updateMenuItem } from "@/lib/api/menu";
import type { MenuItem } from "@/lib/api/types";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function AdminSpecialsPage() {
  const [items, setItems] = useState<MenuItem[]>([]);

  const refresh = () => getMenuItems({}).then(setItems).catch(() => {});
  useEffect(() => { refresh(); }, []);

  const toggleSpecial = async (item: MenuItem) => {
    try {
      await updateMenuItem(item.id, { ...item, is_todays_special: !item.is_todays_special });
      refresh();
      toast.success("Updated");
    } catch {
      toast.error("Failed to update");
    }
  };

  return (
    <div>
      <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-brand-charcoal md:text-3xl">Today&apos;s Specials</h1>
      <p className="mt-1 text-sm text-brand-muted">Toggle which items appear as today&apos;s specials</p>
      <div className="mt-6 space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-xl border border-brand-gold/35 bg-brand-surface p-4 shadow-[var(--shadow-card)]">
            <span className="text-brand-charcoal">{item.name}</span>
            <Switch checked={item.is_todays_special} onCheckedChange={() => toggleSpecial(item)} />
          </div>
        ))}
      </div>
    </div>
  );
}
