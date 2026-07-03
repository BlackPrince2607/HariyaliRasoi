"use client";

import { useEffect, useState } from "react";
import { getStoreSettings } from "@/lib/api/admin";
import type { StoreSettings } from "@/lib/api/types";
import { useCartStore } from "@/store/cartStore";

export function useStore() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const setDeliverySettings = useCartStore((s) => s.setDeliverySettings);

  useEffect(() => {
    getStoreSettings()
      .then((data) => {
        setSettings(data);
        setDeliverySettings(
          Number(data.delivery_fee),
          Number(data.free_delivery_threshold)
        );
      })
      .catch(() => setSettings(null))
      .finally(() => setLoading(false));
  }, [setDeliverySettings]);

  return { settings, loading, isOpen: settings?.is_open ?? true };
}
