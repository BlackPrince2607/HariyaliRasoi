"use client";

import { Moon } from "lucide-react";
import { useStore } from "@/lib/hooks/useStore";

export function StoreClosedBanner() {
  const { settings, loading, isOpen } = useStore();
  if (loading || isOpen) return null;

  return (
    <div className="sticky top-16 z-40 border-b border-brand-gold/40 bg-brand-saffron/12 px-4 py-2.5 text-center">
      <p className="flex items-center justify-center gap-2 text-sm font-medium text-brand-charcoal">
        <Moon className="h-4 w-4 text-brand-saffron" />
        {settings?.closed_message || "Our kitchen is resting right now — please check back during opening hours."}
      </p>
    </div>
  );
}
