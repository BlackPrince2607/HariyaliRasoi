/**
 * Merge scraped Zomato menu into backend seed format.
 * Prices come from existing seed (Zomato web hides prices when closed).
 * Images and descriptions come from Zomato where matched.
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { downloadAllImages, resetFilenameCache } from "./lib/images.js";
import { writeJson, info, warn } from "./lib/utils.js";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SCRAPED_PATH = path.join(ROOT, "output", "menu.json");
const SEED_PATH = path.join(ROOT, "..", "..", "backend", "seed", "menu.json");
const OUT_SEED_PATH = path.join(ROOT, "output", "menu-seed.json");

const ZOMATO_CATEGORY_MAP = {
  Sweets: { name: "Sweets", slug: "sweets" },
  Bread: { name: "Roti & Paratha", slug: "roti-paratha" },
  Chinese: { name: "Chinese", slug: "chinese" },
  "Drinks (Beverages)": { name: "Beverages", slug: "beverages" },
};

const SKIP_ZOMATO_NAMES = new Set([
  "a refreshing drink",
]);

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
    .replace(/\(\d+pc\)/gi, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(name) {
  return normalizeName(name)
    .split(" ")
    .filter((t) => t.length > 1)
    .sort();
}

function nameScore(a, b) {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (!na || !nb) return 0;
  if (na === nb) return 100;
  if (na.includes(nb) || nb.includes(na)) return 88;

  const ta = tokens(a);
  const tb = tokens(b);
  const setA = new Set(ta);
  const setB = new Set(tb);
  let overlap = 0;
  for (const t of setA) if (setB.has(t)) overlap++;
  const jaccard = overlap / new Set([...setA, ...setB]).size;
  const score = jaccard * 100;
  return score;
}

function findBestSeedMatch(zomatoName, seedItems) {
  let best = null;
  let bestScore = 0;
  for (const item of seedItems) {
    const score = nameScore(zomatoName, item.name);
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }
  return bestScore >= 42 ? { item: best, score: bestScore } : null;
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

function avgPriceForCategory(seedItems, categorySlug) {
  const prices = seedItems
    .filter((i) => i.category_slug === categorySlug && i.price > 0)
    .map((i) => Number(i.price));
  if (prices.length === 0) return 80;
  return Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
}

function uniqueSlug(base, existing) {
  let slug = slugify(base);
  if (!existing.has(slug)) return slug;
  let i = 2;
  while (existing.has(`${slug}-${i}`)) i++;
  return `${slug}-${i}`;
}

async function main() {
  resetFilenameCache();

  const scraped = JSON.parse(await fs.readFile(SCRAPED_PATH, "utf-8"));
  const seed = JSON.parse(await fs.readFile(SEED_PATH, "utf-8"));
  const zomatoItems = flattenScraped(scraped).filter(
    (i) => !SKIP_ZOMATO_NAMES.has(normalizeName(i.name))
  );

  info(`Scraped ${zomatoItems.length} Zomato items`);
  info(`Existing seed has ${seed.items.length} items`);

  await downloadAllImages(zomatoItems.filter((i) => i.imageUrl));

  let matched = 0;
  let updated = 0;
  let added = 0;
  const existingSlugs = new Set(seed.items.map((i) => i.slug));

  for (const zItem of zomatoItems) {
    const found = findBestSeedMatch(zItem.name, seed.items);
    if (found) {
      matched++;
      const match = found.item;
      if (zItem.description && zItem.description.length > 10 && !zItem.description.includes("read more")) {
        match.description = zItem.description;
        updated++;
      }
      if (zItem.imageUrl) {
        match.image_url = zItem.imageUrl;
        updated++;
      }
      continue;
    }

    const catMap = ZOMATO_CATEGORY_MAP[zItem.category] || {
      name: zItem.category,
      slug: slugify(zItem.category),
    };

    const slug = uniqueSlug(zItem.name, existingSlugs);
    existingSlugs.add(slug);

    seed.items.push({
      name: zItem.name,
      slug,
      category_slug: catMap.slug,
      description: zItem.description || `From Hariyali Rasoi's ${catMap.name} menu on Zomato.`,
      price: avgPriceForCategory(seed.items, catMap.slug),
      tags: normalizeName(zItem.name).split(" ").filter((t) => t.length > 2).slice(0, 8),
      is_veg: zItem.veg !== false,
      is_available: true,
      is_out_of_stock: false,
      is_bestseller: false,
      is_new: false,
      is_todays_special: false,
      preparation_time: 30,
      display_order: seed.items.length + 1,
      ...(zItem.imageUrl ? { image_url: zItem.imageUrl } : {}),
    });
    added++;
    info(`Added new item: ${zItem.name} (${catMap.slug})`);
  }

  // Ensure Zomato categories exist in seed
  const existingCatSlugs = new Set(seed.categories.map((c) => c.slug));
  let displayOrder = Math.max(...seed.categories.map((c) => c.display_order || 0), 0);
  for (const mapped of Object.values(ZOMATO_CATEGORY_MAP)) {
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

  info("--- Merge Summary ---");
  info(`Zomato items matched to seed: ${matched}/${zomatoItems.length}`);
  info(`New items added from Zomato: ${added}`);
  info(`Seed items updated (desc/image): ${updated}`);
  info(`Total seed items: ${seed.items.length}`);
  info(`Wrote ${OUT_SEED_PATH}`);
  info(`Updated ${SEED_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
