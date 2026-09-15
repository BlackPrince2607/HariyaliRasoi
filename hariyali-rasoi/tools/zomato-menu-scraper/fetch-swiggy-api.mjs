/**
 * Fetch Swiggy menu API directly (no Playwright).
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { parseSwiggyResponse, groupSwiggyItems } from "./lib/swiggy.js";
import { writeJson, info } from "./lib/utils.js";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, "output");

const LAT = process.env.SWIGGY_LAT || "22.6197";
const LNG = process.env.SWIGGY_LNG || "88.4319";
const REST_ID = process.env.SWIGGY_REST_ID || "645341";

const url = `https://www.swiggy.com/dapi/menu/pl?page-type=REGULAR_MENU&complete-menu=true&lat=${LAT}&lng=${LNG}&restaurantId=${REST_ID}&catalog_qa=undefined&submitAction=ENTER`;

const res = await fetch(url, {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    Accept: "application/json",
    Referer: "https://www.swiggy.com/",
  },
});

if (!res.ok) {
  console.error("HTTP", res.status);
  process.exit(1);
}

const data = await res.json();
const rawPath = path.join(OUT, "raw-swiggy-response.json");
await writeJson(rawPath, { capturedAt: new Date().toISOString(), url, data });

const items = parseSwiggyResponse(data);
info(`Parsed ${items.length} items (${items.filter((i) => i.imageUrl).length} with images)`);

if (items.length > 0) {
  const categories = groupSwiggyItems(items);
  await writeJson(path.join(OUT, "swiggy-menu.json"), {
    restaurant: "Hariyali Rasoi",
    source: "swiggy-api",
    scrapedAt: new Date().toISOString(),
    categories: categories.map((c) => ({
      name: c.name,
      items: c.items.map((i) => ({
        name: i.name,
        price: i.price,
        description: i.description,
        veg: i.veg,
        imageUrl: i.imageUrl,
      })),
    })),
  });
  info("Updated swiggy-menu.json");
} else {
  info("No items parsed — keeping existing swiggy-menu.json");
}
