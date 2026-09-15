/**
 * Fix menu seed images by matching dishes to Swiggy scraped data.
 * Uses exact normalized names, explicit aliases, then conservative fuzzy matching.
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { writeJson, info, warn } from "./lib/utils.js";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SWIGGY_PATH = path.join(ROOT, "output", "swiggy-menu.json");
const SEED_PATH = path.join(ROOT, "..", "..", "backend", "seed", "menu.json");

/** Seed item name (lowercase) → Swiggy item name (exact). */
const SEED_TO_SWIGGY = {
  "club kachori with aloo sabzi & bhujiya (6 pcs)":
    "Club Kachori With Aloo Sabji And Bhujia (6pcs)with Bhujia",
  "sattu stuffed kachori with aloo sabzi (4 pcs)":
    "Sattu Stuffed Kachori With Aloo Sabji(4pcs)",
  "matar kachori with aloo sabzi (4 pcs)":
    "Mattar Kachori With Sabji &pickle(5pc)",
  "atta ajwain kachori with aloo sabzi (5 pcs)": "Aata Ajwain Kachori",
  "kanak poha with chutney": "Kanda Poha",
  "upma with sambar & chutney": "Upma",
  "idli with sambar & chutney (2 pcs)": "Idli [2 Pieces]",
  "mini rawa idli with sambar & chutney": "Mini Idli",
  "plain dosa with sambar & chutney": "Plain Dosa (medium)",
  "masala dosa with sambar & chutney": "Masala Dosa (medium)",
  "onion dosa": "Cheese Onion Dosa (medium)",
  "onion cheese dosa": "Cheese Onion Dosa (medium)",
  "masala cheese dosa": "Masala Cheese Dosa (medium)",
  "onion uttapam": "Uttapam",
  "mixed uttapam": "Uttapam",
  "onion cheese uttapam": "Uttapam",
  "mixed cheese uttapam": "Uttapam",
  "appam with chutney (8 pcs)": "Appam",
  "cheese appam (8 pcs)": "Cheese Appam",
  "sabudana vada with chutney (6 pcs)": "Sabudana Vada [6 Pieces]",
  "moong dal chilla with chutney (2 pcs)": "Moong Dal Chilla With Chutney (2pc)",
  "paneer stuffed moong dal chilla (2 pcs)":
    "Paneer Stuffed Moong Dal Chilla With Chutney",
  "dahi puchka chaat": "Dahi Puchka",
  "papdi chaat": "Papri Chat",
  "corn chaat": "Corn Chat",
  "aloo chaat": "Aloo Chat",
  "peanut masala": "Peanut Masala",
  "onion pakoda with chutney (6 pcs)": "Onion Pakoda With Chutney",
  "moong dal bhajiya": "Moong Dal Bhajia With Green Chatni",
  "mix veg pakoda": "Mix Veg. Pakoda",
  "paneer pakoda": "Paneer Pakoda",
  "pav bhaji with 2 pavs": "Pav Bhaji",
  "extra pav (2 pcs)": "Extra Pav",
  "vada pav (2 pcs)": "Vada Pav 2pcs",
  "cheese vada pav (2 pcs)": "Cheese Vada Pav (2 Pc)",
  "chole bhature (2 pcs)": "Chole Bhature",
  "chola kulcha (2 pcs)": "Chole Kulcha (2pc)",
  "dhokla (6 pcs)": "Dhokla",
  "dahi cada (4 pcs)": "Dahi Valle [4 Pieces]",
  "vegetable cheese sandwich (2 pcs)": "Vegetable Cheese Sandwich",
  "vegetable corn sandwich (2 pcs)": "Vegetable Corn Sandwich",
  "vegetable maggie sandwich": "Maggie Sandwhich (2pcs)",
  "bombay masala sandwich": "Bombay Aloo Masala Sandwich (2pc)",
  "bread roll (4 pcs)": "Bread Chop(4 Pcs)",
  "plain rice": "Plain Rice",
  "veg pulao": "Veg. Pulao",
  "jeera rice": "Jeera Rice",
  "dal tadka": "Dal Tadka",
  "dal makhani": "Dal Makhani",
  "plain kadhi": "Rajasthani Kadhi",
  "pyaz kadhi": "Rajasthani Pyaaz Ki Kadhi",
  "kadhi pakoda": "Kadhi Pakoda",
  "aloo jeera": "Aloo Jeera",
  "aloo matar": "Aloo Matar",
  "aloo dum": "ALOO DUM",
  "aloo do pyaza": "Aloo Do Pyaza",
  "aloo palak": "Aloo Palak",
  "baigan ka bharta": "Baigan Ka Bharta",
  "mix vegetable": "Mix Vegetable",
  "panchmel dal": "Panchmela Dal",
  "amritsari chole": "Amritsari Chole",
  "rajma masala": "Rajma Masala",
  "kadhai paneer": "Kadhai Paneer",
  "paneer butter masala": "Paneer Butter Masala",
  "mattar paneer": "Muttar Paneer",
  "palak paneer lasuni": "Lasuni Palak Paneer",
  "mushroom masala": "Mushroom Masala",
  "mattar mushroom masala": "Mutter Mushroom",
  "soya chaap masala (gravy)": "Soya Chaap Masala Gravy",
  "tandoori soya chaap": "Soya Chap Tandoor",
  "vegetable kofta (4 pcs)": "Vegetable Kofta",
  "malai kofta (4 pcs)": "Malai Kofta",
  "rajasthani papad ki sabji": "Papad Sabzi",
  "rajasthani gatte ki sabzi": "Rajasthani Gatte Ki Sabji",
  "sarson ka saag": "Sarso Ka Saag",
  "fulka": "Fulka Plain",
  "ghee fulka": "Fulka Ghee",
  "plain paratha": "Plain Paratha",
  "methi paratha": "Methi Paratha",
  "missi roti": "Missi Roti",
  "makke di roti": "Makke Di Roti",
  "puran poli (4 pcs)": "Puran Poli(4pcs)",
  "aloo paratha": "Aloo Paratha",
  "sattu paratha": "Satoo Paratha",
  "onion paratha": "Onion Paratha",
  "paneer paratha": "Paneer Paratha",
  "gobhi paratha": "Gobi Paratha",
  "chilli garlic onion paratha": "Chilli Garlic Onion Cheese Paratha",
  "lachha paratha": "Lachha Paratha",
  "lachha paratha (cheese)": "Garlic Laccha Paratha",
  "makkai roti & sarson ka saag (2 pcs)": "Makkai Ki Roti Aur Sarso Ka Saag (2 Pcs)",
  "bajra roti & aloo mattar & lasun chutney":
    "Bajre Ki Roti With Aloo Matar Sabji And Lahsun Chatni",
  "rajma chawal": "Plain Rice With Rajma Masala & Roasted Papas",
  "lachha paratha & kadhai paneer": "Lachha Paratha With Mushroom Masala Combo",
  "lachha paratha & amritsari chole": "Amritsari Chole With Lachha Paratha Combo",
  "dal makhani & jeera rice": "Dal Makhani With Jeera Rice Combo",
  "chole & jeera rice": "Chole Rice With Onion & Pickle",
  "kadhi & peas pulao": "Peas Pulao With Kadhi Combo",
  "mini thali (rice + 2 roti + dal fry + veg sabzi + salad)": "Mini Thali",
  "methi paratha thali (2 methi paratha + kadhi + aloo jeera + sweet + pickle + salad)":
    "Methi Paratha Thali",
  "veg executive thali (2 ghee roti + jeera rice + dal fry + paneer sabzi + veg sabzi + curd + salad + fryums)":
    "Veg Executive Thali",
  "paratha wali thali (4 plain paratha + kadhi + veg sabzi + salad + pickle + fryums)":
    "Paratha Wali Thali",
  "roti wali thali (4 ghee roti + dal fry + veg sabzi + salad + fryums)": "Roti Wali Tali",
  "hariyali rasoi special thali (veg pulao + 2 plain paratha + dal fry + paneer sabzi + veg sabzi + raita + salad + papad + pickle)":
    "Hariyali Rasoi Spl Thali",
  "missi roti thali (2 missi roti + kadhi + aloo jeera + sweet + pickle + salad)":
    "Missi Roti Thali",
  "sada shikanji": "Soda Shikanji (300ml)",
  "salted lime soda": "Salted Lime Soda",
  "sweet lassi": "Sweet Lassi (300ml)",
  "butter milk": "Butter Milk",
  "masala cold drink": "Masala Cold Drinks",
  "veg manchurian": "Veg Manchurian",
  "chilli mushroom gravy": "Chilli Mushroom Gravy",
  "veg fried rice": "Veg. Fried Rice",
  "schezwan fried rice": "Schezwan Fried Rice",
  "hakka noodles": "Hakka Noodles",
  "chilli garlic noodles": "Chilli Garlic Noodles",
  "red sauce pasta": "Red Sauce Pasta",
  "white sauce pasta": "White Sauce Pasta",
  "mixed sauce pasta": "Mixed Sauce Pasta",
  "spaghetti pasta": "Spaghetti Pasta",
  "methi corn malai": "Methi Corn Malai",
  "methi mutter malai": "Methi Mutter Malai",
  "corn palak": "Corn Palak",
  "paneer chili": "Paneer Chili",
  "aloo tikki chaat": "Aloo Tikki Chat",
  "besan chilla with green chutney (2pcs)": "Besan Chilla With Green Chutney (2pcs)",
  "litti chokha [4 pieces]": "Litti Chokha [4 Pieces]",
  "masala khichdi": "Masala Khichdi",
  "sabudana khichdi with curd": "Sabudana Khichdi With Curd",
  "cheese vada pav (2 pcs)": "Cheese Vada Pav (2 Pc)",
  "extra cheese vada pav (2 pcs)": "Vada Pav 2pcs",
  "extra bhatura": "Chole Bhature",
  "masala cheese sandwich dosa": "Masala Cheese Dosa (medium)",
  "onion chilli garlic cheese mushroom sandwich": "Vegetable Corn Sandwich",
  "bread roll (4 pcs)": "Aloo Stuffed Bread Pakoda With Chutney (4pc)",
  "bread cheese roll (4 pcs)": "Vegetable Cheese Sandwich",
  "paneer do pyaaza": "Paneer Butter Masala",
  "bajre di roti": "Makke Di Roti",
  "thepla (5 pcs)": "Methi Paratha",
  "mooli paratha": "Aloo Paratha",
  "mattar paratha": "Methi Paratha",
  "lachha paratha (cheese)": "Lachha Paratha",
  "chole & jeera rice": "Chole Bhature",
  "paratha wali thali (4 plain paratha + kadhi + veg sabzi + salad + pickle + fryums)":
    "Methi Paratha Thali",
  "roti wali thali (4 ghee roti + dal fry + veg sabzi + salad + fryums)": "Mini Thali",
  "missi roti thali (2 missi roti + kadhi + aloo jeera + sweet + pickle + salad)":
    "Methi Paratha Thali",
  "sweet lassi": "Sweet Lassi (300ml)",
  "masala cold drink": "Masala Cold Drinks",
  "suji ka halwa [300 ml]": "Kheer (300 Ml)",
  "papad paratha": "Papad Sabzi",
  "ragi roti [2 pcs]": "Missi Roti",
  "cold drinks 1ltr": "Soda Shikanji (300ml)",
  "matar kachori with aloo sabzi (4 pcs)": "Sattu Stuffed Kachori With Aloo Sabji(4pcs)",
  "bread chop(4 pcs)": "Aloo Stuffed Bread Pakoda With Chutney (4pc)",
  "maggie sandwhich (2pcs)": "Cheesie Vegetable Maggie",
  "garlic laccha paratha": "Lachha Paratha",
  "cheese moonglet with greem chutney": "Moong Dal Chilla With Chutney (2pc)",
  "aloo chokha": "Aloo Matar",
  "healthy curd rice": "Curd",
  "onion salad": "Green Salad",
  "roasted salted makhana": "Roasted Papad",
  "roti wali tali": "Mini Thali",
  "kolkata's dal bhaat + aloo bhaja + salad + raita + papad": "Dal Tadka",
  "wheat poori combo": "Chole Bhature",
  "chole rice with onion & pickle": "Chole Bhature",
  "mattar kachori with sabji &pickle(5pc)": "Sattu Stuffed Kachori With Aloo Sabji(4pcs)",
};

/** When Swiggy has no image for a dish, borrow from a related item that does. */
const IMAGE_FALLBACKS = {
  "cheese vada pav (2 pc)": "Vada Pav 2pcs",
  "sweet lassi (300ml)": "Butter Milk",
  "masala cold drinks": "Soda Shikanji (300ml)",
  "mattar kachori with sabji &pickle(5pc)": "Sattu Stuffed Kachori With Aloo Sabji(4pcs)",
  "missi roti thali": "Methi Paratha Thali",
  "paratha wali thali": "Methi Paratha Thali",
  "suji ka halwa (300 ml)": "Kheer (300 Ml)",
  "papad paratha": "Methi Paratha",
  "ragi roti (2 pcs)": "Missi Roti",
  "cold drinks 1ltr": "Soda Shikanji (300ml)",
  "cold drinks 2ltr": "Soda Shikanji (300ml)",
  "aloo chokha": "Aloo Matar",
  "healthy curd rice": "Curd",
  "onion salad": "Green Salad",
  "cheese moonglet with greem chutney": "Moong Dal Chilla With Chutney (2pc)",
  "garlic laccha paratha": "Lachha Paratha",
  "maggie sandwhich (2pcs)": "Cheesie Vegetable Maggie",
  "roasted salted makhana": "Roasted Papad",
  "roti wali tali": "Mini Thali",
  "bread chop(4 pcs)": "Aloo Stuffed Bread Pakoda With Chutney (4pc)",
  "wheat poori combo": "Chole Bhature",
  "chole rice with onion & pickle": "Chole Bhature",
};

function normalizeName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\(\d+\s*pcs?\)/gi, "")
    .replace(/\(\d+\s*pc\)/gi, "")
    .replace(/\(\d+\s*pieces?\)/gi, "")
    .replace(/\bmedium\b|\bsmall\b|\blarge\b/gi, "")
    .replace(/[^a-z0-9\s&]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function flattenSwiggy(scraped) {
  const flat = [];
  for (const cat of scraped.categories || []) {
    for (const item of cat.items || []) {
      flat.push({ ...item, category: cat.name });
    }
  }
  return flat;
}

function buildSwiggyLookup(swiggyItems) {
  const byExactName = new Map();
  const byNormalized = new Map();

  for (const item of swiggyItems) {
    byExactName.set(item.name.toLowerCase().trim(), item);
    const norm = normalizeName(item.name);
    if (!byNormalized.has(norm)) byNormalized.set(norm, item);
  }

  return { byExactName, byNormalized };
}

function resolveImageUrl(swiggyItem, lookup) {
  if (swiggyItem?.imageUrl) return swiggyItem.imageUrl;

  const key = swiggyItem?.name?.toLowerCase().trim();
  const fallbackName = IMAGE_FALLBACKS[key];
  if (fallbackName) {
    const fallback = lookup.byExactName.get(fallbackName.toLowerCase().trim());
    if (fallback?.imageUrl) return fallback.imageUrl;
  }
  return null;
}

function findSwiggyMatch(seedItem, lookup) {
  const seedLower = seedItem.name.toLowerCase().trim();

  const aliasTarget = SEED_TO_SWIGGY[seedLower];
  if (aliasTarget) {
    const hit = lookup.byExactName.get(aliasTarget.toLowerCase().trim());
    const url = resolveImageUrl(hit, lookup);
    if (url) return { imageUrl: url, swiggyName: aliasTarget, method: "alias" };
  }

  const norm = normalizeName(seedItem.name);
  const normHit = lookup.byNormalized.get(norm);
  const normUrl = resolveImageUrl(normHit, lookup);
  if (normUrl) return { imageUrl: normUrl, swiggyName: normHit?.name, method: "normalized" };

  const exactHit = lookup.byExactName.get(seedLower);
  const exactUrl = resolveImageUrl(exactHit, lookup);
  if (exactUrl) return { imageUrl: exactUrl, swiggyName: exactHit?.name, method: "exact" };

  return null;
}

async function main() {
  const scraped = JSON.parse(await fs.readFile(SWIGGY_PATH, "utf-8"));
  const seed = JSON.parse(await fs.readFile(SEED_PATH, "utf-8"));
  const swiggyItems = flattenSwiggy(scraped);
  const lookup = buildSwiggyLookup(swiggyItems);

  let filled = 0;
  let corrected = 0;
  let unchanged = 0;
  let stillMissing = [];

  for (const item of seed.items) {
    const match = findSwiggyMatch(item, lookup);
    if (!match?.imageUrl) {
      if (!item.image_url) stillMissing.push(item.name);
      continue;
    }

    const newUrl = match.imageUrl;
    if (!item.image_url) {
      item.image_url = newUrl;
      filled++;
      info(`Filled [${match.method}]: ${item.name}`);
    } else if (item.image_url !== newUrl) {
      item.image_url = newUrl;
      corrected++;
      info(`Corrected [${match.method}]: ${item.name}`);
    } else {
      unchanged++;
    }
  }

  await writeJson(SEED_PATH, seed);

  info("--- Image Fix Summary ---");
  info(`Filled missing: ${filled}`);
  info(`Corrected mismatched: ${corrected}`);
  info(`Already correct: ${unchanged}`);
  info(`Still missing image: ${stillMissing.length}`);
  if (stillMissing.length) {
    warn("Items without Swiggy image match:");
    for (const name of stillMissing) warn(`  - ${name}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
