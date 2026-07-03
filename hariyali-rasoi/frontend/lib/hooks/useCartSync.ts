"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cartStore";
import { syncCartWithMenu } from "@/lib/utils/cartSync";

/** Validates persisted cart items against the live menu on mount. */
export function useCartSync() {
  const items = useCartStore((s) => s.items);
  const setItems = useCartStore((s) => s.setItems);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current || items.length === 0) return;
    ran.current = true;

    syncCartWithMenu(items)
      .then(({ items: synced, removed }) => {
        if (removed.length === 0) return;
        setItems(synced);
        const names = removed.map((r) => `${r.name} (${r.reason})`).join(", ");
        toast.error(`Removed from cart: ${names}. Please add fresh items from the menu.`);
      })
      .catch(() => {
        // Menu fetch failed — checkout will surface errors if needed
      });
  }, [items, setItems]);
}
