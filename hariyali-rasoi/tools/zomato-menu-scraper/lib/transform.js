/**
 * Merge, dedupe, and shape final menu JSON outputs.
 */
import {
  RESTAURANT_NAME,
  itemKey,
  parsePrice,
} from "./utils.js";

/**
 * Merge API and DOM items, preferring API source on duplicates.
 */
export function mergeItems(apiItems, domItems) {
  const map = new Map();

  for (const item of domItems) {
    const key = itemKey(item.category, item.name);
    if (!map.has(key)) {
      map.set(key, { ...item });
    }
  }

  for (const item of apiItems) {
    const key = itemKey(item.category, item.name);
    const existing = map.get(key);
    if (existing) {
      // API wins — fill missing fields from DOM
      map.set(key, {
        ...existing,
        ...item,
        description: item.description || existing.description,
        imageUrl: item.imageUrl || existing.imageUrl,
        source: "api",
      });
    } else {
      map.set(key, { ...item });
    }
  }

  return [...map.values()];
}

/**
 * Group flat items into category structure for menu.json.
 */
export function groupByCategory(items) {
  const categoryMap = new Map();
  const categoryOrder = [];

  for (const item of items) {
    const catName = item.category || "Uncategorized";
    if (!categoryMap.has(catName)) {
      categoryMap.set(catName, []);
      categoryOrder.push(catName);
    }
    categoryMap.get(catName).push({
      name: item.name,
      price: parsePrice(item.price) ?? 0,
      description: item.description || "",
      veg: item.veg !== false,
      imageUrl: item.imageUrl || "",
      localImage: item.localImage || "",
    });
  }

  return categoryOrder.map((name) => ({
    name,
    items: categoryMap.get(name),
  }));
}

/**
 * Build primary menu.json structure.
 */
export function buildMenuJson(items) {
  const categories = groupByCategory(items);
  const totalItems = categories.reduce((sum, c) => sum + c.items.length, 0);

  return {
    restaurant: RESTAURANT_NAME,
    scrapedAt: new Date().toISOString(),
    categories,
    _meta: {
      totalCategories: categories.length,
      totalItems,
    },
  };
}

/**
 * Build flat menu-for-website.json array.
 */
export function buildWebsiteMenuJson(items) {
  return items.map((item) => ({
    name: item.name,
    price: parsePrice(item.price) ?? 0,
    category: item.category || "Uncategorized",
    image: item.localImage || item.imageUrl || "",
    description: item.description || "",
  }));
}

/**
 * Count stats from grouped menu.
 */
export function countStats(menuJson) {
  const categories = menuJson.categories?.length ?? 0;
  const items = menuJson.categories?.reduce((n, c) => n + c.items.length, 0) ?? 0;
  return { categories, items };
}
