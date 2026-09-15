/**
 * Remove duplicate menu items from seed (Swiggy merge artifacts).
 * Keeps the canonical item and transfers image_url if needed.
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { writeJson, info, warn } from "./lib/utils.js";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SEED_PATH = path.join(ROOT, "..", "..", "backend", "seed", "menu.json");

/** duplicate slug → canonical slug to keep */
const DUPLICATE_SLUGS = {
  "corn-chat": "corn-chaat",
  "aloo-chat": "aloo-chaat",
  "roti-wali-tali": "roti-wali-thali-4-ghee-roti-dal-fry-veg-sabzi-salad-fryums",
  "mattar-kachori-with-sabji-pickle-5pc": "matar-kachori-with-aloo-sabzi-4-pcs",
  "mini-idli": "mini-rawa-idli-with-sambar-chutney",
  "moong-dal-bhajia-with-green-chatni": "moong-dal-bhajiya",
  "dahi-valle-4-pieces": "dahi-cada-4-pcs",
  "chole-kulcha-2pc": "chola-kulcha-2-pcs",
  "maggie-sandwhich-2pcs": "vegetable-maggie-sandwich",
  "bread-chop-4-pcs": "bread-roll-4-pcs",
  "rajasthani-kadhi": "plain-kadhi",
  "chole-rice-with-onion-pickle": "chole-jeera-rice",
};

async function main() {
  const seed = JSON.parse(await fs.readFile(SEED_PATH, "utf-8"));
  const bySlug = new Map(seed.items.map((i) => [i.slug, i]));
  const removeSlugs = new Set(Object.keys(DUPLICATE_SLUGS));

  let removed = 0;
  let imagesTransferred = 0;

  for (const [dupSlug, canonSlug] of Object.entries(DUPLICATE_SLUGS)) {
    const dup = bySlug.get(dupSlug);
    const canon = bySlug.get(canonSlug);
    if (!dup) {
      warn(`Duplicate not found: ${dupSlug}`);
      continue;
    }
    if (!canon) {
      warn(`Canonical not found for ${dupSlug} → ${canonSlug}`);
      continue;
    }
    if (dup.image_url && !canon.image_url) {
      canon.image_url = dup.image_url;
      imagesTransferred++;
    }
    info(`Removing duplicate: ${dup.name} (kept: ${canon.name})`);
    removed++;
  }

  seed.items = seed.items.filter((i) => !removeSlugs.has(i.slug));

  await writeJson(SEED_PATH, seed);

  info("--- Dedupe Summary ---");
  info(`Removed duplicates: ${removed}`);
  info(`Images transferred: ${imagesTransferred}`);
  info(`Remaining items: ${seed.items.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
