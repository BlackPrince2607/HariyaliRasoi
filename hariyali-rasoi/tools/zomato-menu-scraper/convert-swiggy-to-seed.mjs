/**
 * Merge Swiggy scraped menu into backend seed.
 * Swiggy prices and images take priority over existing seed values.
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { downloadAllImages, resetFilenameCache } from "./lib/images.js";
import { writeJson, info, warn } from "./lib/utils.js";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SWIGGY_PATH = path.join(ROOT, "output", "swiggy-menu.json");
const SEED_PATH = path.join(ROOT, "..", "..", "backend", "seed", "menu.json");
const OUT_SEED_PATH = path.join(ROOT, "output", "menu-seed.json");

const SWIGGY_CATEGORY_MAP = {
  "Lunch & Dinner": { name: "Veg Curries", slug: "veg-curries" },
  "Round The Clock": { name: "Combos", slug: "combos" },
  Bread: { name: "Roti & Paratha", slug: "roti-paratha" },
  "Veg Thali": { name: "Thali", slug: "thali" },
  Snacks: { name: "Evening Snacks & Chaat", slug: "evening-snacks-chaat" },
  Chinese: { name: "Chinese", slug: "chinese" },
  Combo: { name: "Combos", slug: "combos" },
  "South Indian": { name: "Breakfast", slug: "breakfast" },
  Breakfast: { name: "Breakfast", slug: "breakfast" },
  Chats: { name: "Evening Snacks & Chaat", slug: "evening-snacks-chaat" },
  Beverages: { name: "Beverages", slug: "beverages" },
  Sweets: { name: "Sweets", slug: "sweets" },
};

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\(\d+\s*pcs?\)/gi, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function nameScore(a, b) {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (!na || !nb) return 0;
  if (na === nb) return 100;
  if (na.includes(nb) || nb.includes(na)) return 88;
  const setA = new Set(na.split(" ").filter((t) => t.length > 1));
  const setB = new Set(nb.split(" ").filter((t) => t.length > 1));
  let overlap = 0;
  for (const t of setA) if (setB.has(t)) overlap++;
  return (overlap / new Set([...setA, ...setB]).size) * 100;
}

function findBestSeedMatch(name, seedItems) {
  let best = null;
  let bestScore = 0;
  for (const item of seedItems) {
    const score = nameScore(name, item.name);
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }
  return bestScore >= 42 ? best : null;
}

function flattenScraped(scraped) {
  const flat = [];
  for (const cat of scraped.categories || []) {
    for (const item of cat.items || []) {
      flat.push({ ...item, category: cat.name });
    }
  }
  return flat;
}

function uniqueSlug(base, existing) {
  let slug = slugify(base);
  if (!existing.has(slug)) return slug;
  let i = 2;
  while (existing.has(`${slug}-${i}`)) i++;
  return `${slug}-${i}`;
}

function mapCategory(swiggyCategory) {
  return (
    SWIGGY_CATEGORY_MAP[swiggyCategory] || {
      name: swiggyCategory,
      slug: slugify(swiggyCategory),
    }
  );
}

async function main() {
  resetFilenameCache();

  const scraped = JSON.parse(await fs.readFile(SWIGGY_PATH, "utf-8"));
  const seed = JSON.parse(await fs.readFile(SEED_PATH, "utf-8"));
  const swiggyItems = flattenScraped(scraped);

  info(`Swiggy items: ${swiggyItems.length}`);
  info(`Existing seed items: ${seed.items.length}`);

  await downloadAllImages(swiggyItems.filter((i) => i.imageUrl));

  let matched = 0;
  let updated = 0;
  let added = 0;
  const existingSlugs = new Set(seed.items.map((i) => i.slug));

  for (const sItem of swiggyItems) {
    const match = findBestSeedMatch(sItem.name, seed.items);

    if (match) {
      matched++;
      if (sItem.price > 0) {
        match.price = sItem.price;
        updated++;
      }
      if (sItem.description?.length > 5) {
        match.description = sItem.description;
        updated++;
      }
      if (sItem.imageUrl) {
        match.image_url = sItem.imageUrl;
        updated++;
      }
      match.is_veg = sItem.veg !== false;
      continue;
    }

    const cat = mapCategory(sItem.category);
    const slug = uniqueSlug(sItem.name, existingSlugs);
    existingSlugs.add(slug);

    seed.items.push({
      name: sItem.name,
      slug,
      category_slug: cat.slug,
      description: sItem.description || `From Hariyali Rasoi on Swiggy (${cat.name}).`,
      price: sItem.price,
      tags: normalizeName(sItem.name).split(" ").filter((t) => t.length > 2).slice(0, 8),
      is_veg: sItem.veg !== false,
      is_available: true,
      is_out_of_stock: false,
      is_bestseller: false,
      is_new: false,
      is_todays_special: false,
      preparation_time: 30,
      display_order: seed.items.length + 1,
      ...(sItem.imageUrl ? { image_url: sItem.imageUrl } : {}),
    });
    added++;
    info(`Added from Swiggy: ${sItem.name} (₹${sItem.price})`);
  }

  const existingCatSlugs = new Set(seed.categories.map((c) => c.slug));
  let displayOrder = Math.max(...seed.categories.map((c) => c.display_order || 0), 0);
  for (const mapped of Object.values(SWIGGY_CATEGORY_MAP)) {
    if (!existingCatSlugs.has(mapped.slug)) {
      seed.categories.push({
        name: mapped.name,
        slug: mapped.slug,
        display_order: ++displayOrder,
        is_active: true,
      });
      existingCatSlugs.add(mapped.slug);
    }
  }

  await writeJson(OUT_SEED_PATH, seed);
  await writeJson(SEED_PATH, seed);

  info("--- Swiggy Merge Summary ---");
  info(`Matched & updated existing items: ${matched}`);
  info(`New items added from Swiggy: ${added}`);
  info(`Field updates (price/desc/image): ${updated}`);
  info(`Total seed items: ${seed.items.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
