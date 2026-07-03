import { getMenuItems } from "@/lib/api/menu";
import type { CartItem } from "@/store/cartStore";

export interface CartSyncResult {
  items: CartItem[];
  removed: { name: string; reason: string }[];
}

/** Drop outdated cart lines and refresh prices from the live menu. */
export async function syncCartWithMenu(items: CartItem[]): Promise<CartSyncResult> {
  if (items.length === 0) {
    return { items: [], removed: [] };
  }

  const menu = await getMenuItems();
  const menuById = new Map(menu.map((m) => [m.id, m]));
  const kept: CartItem[] = [];
  const removed: { name: string; reason: string }[] = [];

  for (const item of items) {
    const menuItem = menuById.get(item.id);
    if (!menuItem) {
      removed.push({ name: item.name, reason: "removed from the menu" });
      continue;
    }
    if (!menuItem.is_available) {
      removed.push({ name: item.name, reason: "no longer available" });
      continue;
    }
    if (menuItem.is_out_of_stock) {
      removed.push({ name: item.name, reason: "out of stock" });
      continue;
    }

    const image = menuItem.images.find((i) => i.is_primary) ?? menuItem.images[0];
    kept.push({
      id: menuItem.id,
      name: menuItem.name,
      price: Number(menuItem.price),
      quantity: item.quantity,
      image_url: image?.url ?? item.image_url,
      is_veg: menuItem.is_veg,
    });
  }

  return { items: kept, removed };
}
