/**
 * Parse Swiggy /dapi/menu/pl JSON into normalized menu items.
 * Swiggy prices are in paise (28500 => ₹285).
 */
import { parsePrice } from "./utils.js";

const SWIGGY_IMAGE_BASE =
  "https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_508,h_320,c_fit/";

/** Build public image URL from Swiggy imageId. */
export function swiggyImageUrl(imageId) {
  if (!imageId) return "";
  return `${SWIGGY_IMAGE_BASE}${imageId}`;
}

/** Convert paise to rupees. */
export function paiseToRupees(paise) {
  const n = Number(paise);
  if (!n || Number.isNaN(n)) return 0;
  return Math.round(n / 100);
}

/** Normalize a Swiggy dish info object. */
export function normalizeSwiggyDish(info, categoryTitle) {
  if (!info?.name) return null;

  const priceRaw = info.price ?? info.defaultPrice ?? info.finalPrice ?? 0;
  const price = paiseToRupees(priceRaw);
  if (price <= 0) return null;

  const category = categoryTitle || info.category || "Uncategorized";
  const veg =
    info.isVeg === 1 ||
    info.isVeg === true ||
    info.itemAttribute?.vegClassifier === "VEG";

  return {
    name: info.name.trim(),
    price,
    description: (info.description || "").trim(),
    veg,
    category,
    imageUrl: swiggyImageUrl(info.imageId),
    source: "swiggy",
  };
}

/**
 * Recursively walk Swiggy card tree and collect dishes.
 */
export function parseSwiggyResponse(root) {
  const items = [];
  const seen = new Set();

  function addItem(info, categoryTitle) {
    const item = normalizeSwiggyDish(info, categoryTitle);
    if (!item) return;
    const key = `${item.category}::${item.name}`.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    items.push(item);
  }

  function walkNode(node) {
    if (!node || typeof node !== "object") return;

    if (Array.isArray(node)) {
      for (const child of node) walkNode(child);
      return;
    }

    const type = node["@type"] || "";

    if (type.includes("ItemCategory") && Array.isArray(node.itemCards)) {
      const categoryTitle = node.title || node.category || "Uncategorized";
      for (const itemCard of node.itemCards) {
        const dishCard = itemCard?.card;
        const info = dishCard?.info;
        if (info) addItem(info, categoryTitle);
      }
    }

    if (node.groupedCard?.cardGroupMap) {
      for (const group of Object.values(node.groupedCard.cardGroupMap)) {
        walkNode(group?.cards);
      }
    }

    if (Array.isArray(node.cards)) walkNode(node.cards);
    if (node.card) walkNode(node.card);

    for (const value of Object.values(node)) {
      if (value && typeof value === "object" && value !== node.card) {
        if (Array.isArray(value) || value["@type"] || value.groupedCard || value.cards) {
          walkNode(value);
        }
      }
    }
  }

  const cards = root?.data?.data?.cards ?? root?.data?.cards ?? [];
  walkNode(cards);

  return items;
}

/** Group flat items by category for menu.json output. */
export function groupSwiggyItems(items) {
  const map = new Map();
  const order = [];
  for (const item of items) {
    if (!map.has(item.category)) {
      map.set(item.category, []);
      order.push(item.category);
    }
    map.get(item.category).push(item);
  }
  return order.map((name) => ({ name, items: map.get(name) }));
}
