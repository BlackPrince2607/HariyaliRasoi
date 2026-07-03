"use client";

import { useCartStore } from "@/store/cartStore";
import type { MenuItem } from "@/lib/api/types";

export function useCart() {
  const store = useCartStore();

  const addMenuItem = (item: MenuItem, quantity = 1) => {
    const image = item.images.find((i) => i.is_primary) ?? item.images[0];
    store.addItem({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      quantity,
      image_url: image?.url ?? "",
      is_veg: item.is_veg,
    });
  };

  return { ...store, addMenuItem };
}
