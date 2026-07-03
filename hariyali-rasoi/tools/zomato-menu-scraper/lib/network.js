/**
 * Network capture and JSON menu extraction.
 * Prefers XHR/Fetch API responses over DOM scraping when Zomato loads menu data.
 */
import { parsePrice, info, warn } from "./utils.js";

const MENU_URL_HINTS = [
  "/gw/menu",
  "/webroutes",
  "graphql",
  "menu",
  "catalog",
  "dish",
  "restaurant",
  "order",
];

const NAME_KEYS = ["name", "item_name", "dish_name", "title", "itemName"];
const PRICE_KEYS = [
  "price",
  "item_price",
  "default_price",
  "min_price",
  "display_price",
  "itemPrice",
];
const DESC_KEYS = ["desc", "description", "item_desc", "itemDescription"];
const IMAGE_KEYS = [
  "item_image_url",
  "image_url",
  "photo_url",
  "thumb",
  "image",
  "itemImage",
  "url",
];
const CATEGORY_KEYS = [
  "category_name",
  "menu_category_name",
  "section_name",
  "category",
  "name",
];

/**
 * Attach a response listener that collects JSON payloads likely containing menu data.
 * Returns a controller with getBestCapture() after navigation/scrolling.
 */
export function createNetworkCapture(page) {
  const captures = [];

  const handler = async (response) => {
    try {
      const url = response.url();
      const contentType = response.headers()["content-type"] || "";
      if (!contentType.includes("application/json")) return;

      const urlLower = url.toLowerCase();
      const looksRelevant =
        urlLower.includes("zomato.com") &&
        (MENU_URL_HINTS.some((hint) => urlLower.includes(hint)) ||
          urlLower.includes("/gw/") ||
          urlLower.includes("webroutes"));
      if (!looksRelevant) return;

      const status = response.status();
      if (status < 200 || status >= 400) return;

      let json;
      try {
        json = await response.json();
      } catch {
        return;
      }

      const items = extractItemsFromJson(json);
      const score = items.length;

      if (score > 0) {
        captures.push({
          url,
          score,
          json,
          items,
        });
        info(`Captured menu-like JSON (${score} items): ${url.slice(0, 120)}`);
      }
    } catch {
      // Non-fatal: some responses may be aborted mid-read
    }
  };

  page.on("response", handler);

  return {
    detach() {
      page.off("response", handler);
    },
    getBestCapture() {
      if (captures.length === 0) return null;
      return captures.reduce((best, cur) => (cur.score > best.score ? cur : best));
    },
    getAllCaptures() {
      return captures;
    },
  };
}

/**
 * Recursively walk JSON and extract menu item objects.
 */
export function extractItemsFromJson(root, parentCategory = "") {
  const found = [];

  function walk(node, categoryContext) {
    if (Array.isArray(node)) {
      for (const child of node) {
        walk(child, categoryContext);
      }
      return;
    }

    if (!node || typeof node !== "object") return;

    // Section / category container
    const sectionName = pickString(node, CATEGORY_KEYS);
    const nextCategory =
      sectionName &&
      (node.items || node.menu_items || node.dishes || node.catalogue)
        ? sectionName
        : categoryContext;

    const nestedKeys = [
      "items",
      "menu_items",
      "dishes",
      "catalogue",
      "categories",
      "sections",
      "menu",
      "data",
      "entities",
      "results",
    ];
    for (const key of nestedKeys) {
      if (node[key]) {
        walk(node[key], nextCategory || categoryContext);
      }
    }

    const item = normalizeMenuObject(node, categoryContext);
    if (item) {
      found.push(item);
    }

    // Walk remaining object values for deeply nested structures
    for (const value of Object.values(node)) {
      if (value && typeof value === "object") {
        walk(value, nextCategory || categoryContext);
      }
    }
  }

  walk(root, parentCategory);

  return dedupeRawItems(found);
}

function pickString(obj, keys) {
  for (const key of keys) {
    const val = obj[key];
    if (typeof val === "string" && val.trim().length > 1 && val.trim().length < 120) {
      return val.trim();
    }
  }
  return null;
}

function pickPrice(obj) {
  for (const key of PRICE_KEYS) {
    if (obj[key] != null) {
      const parsed = parsePrice(obj[key]);
      if (parsed != null && parsed > 0) return parsed;
    }
  }
  // Nested price object: { price: 120 } or { text: "₹120" }
  if (obj.price && typeof obj.price === "object") {
    return pickPrice(obj.price);
  }
  if (obj.default_price && typeof obj.default_price === "object") {
    return pickPrice(obj.default_price);
  }
  return null;
}

function pickImage(obj) {
  for (const key of IMAGE_KEYS) {
    const val = obj[key];
    if (typeof val === "string" && val.startsWith("http")) {
      return val.split("?")[0];
    }
    if (val && typeof val === "object" && val.url) {
      return String(val.url).split("?")[0];
    }
  }
  return "";
}

function inferVeg(obj) {
  if (typeof obj.is_veg === "boolean") return obj.is_veg;
  if (typeof obj.isVeg === "boolean") return obj.isVeg;
  if (Array.isArray(obj.dietary_slugs)) {
    const slugs = obj.dietary_slugs.map((s) => String(s).toLowerCase());
    if (slugs.some((s) => s.includes("non") || s.includes("egg"))) return false;
    if (slugs.some((s) => s.includes("veg"))) return true;
  }
  const tag = JSON.stringify(obj.item_tag_image || obj.tag || "").toLowerCase();
  if (tag.includes("non") && tag.includes("veg")) return false;
  if (tag.includes("veg")) return true;
  return true; // Hariyali Rasoi default
}

/** Try to normalize a single object into a menu item. Returns null if not a dish. */
function normalizeMenuObject(obj, categoryContext) {
  if (!obj || typeof obj !== "object") return null;

  const name = pickString(obj, NAME_KEYS);
  const price = pickPrice(obj);

  if (!name || price == null) return null;
  // Allow price 0 for DOM-only items (merged from seed later)
  if (price < 0) return null;

  // Skip obvious non-dish entries (restaurant names, banners)
  if (/^(order|menu|recommended|popular)$/i.test(name)) return null;
  if (name.length < 2 || name.length > 200) return null;

  const category =
    pickString(obj, ["category_name", "menu_category_name", "section_name"]) ||
    categoryContext ||
    "Uncategorized";

  const description = pickString(obj, DESC_KEYS) || "";

  return {
    name,
    price,
    description,
    veg: inferVeg(obj),
    category,
    imageUrl: pickImage(obj),
    source: "api",
  };
}

function dedupeRawItems(items) {
  const seen = new Map();
  for (const item of items) {
    const key = `${item.category}::${item.name}`.toLowerCase();
    if (!seen.has(key)) {
      seen.set(key, item);
    }
  }
  return [...seen.values()];
}

/**
 * Parse the best captured network response into normalized items.
 */
export function parseBestNetworkCapture(capture) {
  if (!capture) {
    warn("No menu JSON captured from network responses.");
    return [];
  }
  info(`Using best network capture (${capture.score} items) from: ${capture.url}`);
  return capture.items;
}

/**
 * Detect if page may be blocked by anti-bot (challenge HTML, empty menu).
 */
export function detectBlockedPage(htmlSnippet) {
  const lower = htmlSnippet.toLowerCase();
  return (
    lower.includes("access denied") ||
    lower.includes("captcha") ||
    lower.includes("cf-browser-verification") ||
    lower.includes("please enable javascript")
  );
}
