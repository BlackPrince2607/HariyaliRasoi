/**
 * Shared utilities: paths, logging, slugify, price parsing, dedupe keys.
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT_DIR = path.resolve(__dirname, "..");
export const OUTPUT_DIR = path.join(ROOT_DIR, "output");
export const IMAGES_DIR = path.join(ROOT_DIR, "downloads", "images");
export const RAW_MENU_PATH = path.join(OUTPUT_DIR, "raw-menu-response.json");
export const MENU_PATH = path.join(OUTPUT_DIR, "menu.json");
export const WEBSITE_MENU_PATH = path.join(OUTPUT_DIR, "menu-for-website.json");

export const RESTAURANT_NAME = "Hariyali Rasoi";
export const TARGET_URL =
  "https://www.zomato.com/kolkata/hariyali-rasoi-chinar-park/order";

/** Ensure output and image directories exist. */
export async function ensureDirs() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.mkdir(IMAGES_DIR, { recursive: true });
}

/** Simple timestamped logger. */
export function log(level, message, ...args) {
  const prefix = `[${new Date().toISOString()}] [${level}]`;
  if (level === "ERROR") {
    console.error(prefix, message, ...args);
  } else if (level === "WARN") {
    console.warn(prefix, message, ...args);
  } else {
    console.log(prefix, message, ...args);
  }
}

export const info = (msg, ...a) => log("INFO", msg, ...a);
export const warn = (msg, ...a) => log("WARN", msg, ...a);
export const error = (msg, ...a) => log("ERROR", msg, ...a);

/** Normalize text for dedupe keys. */
export function normalizeKey(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Build dedupe key from category + item name. */
export function itemKey(category, name) {
  return `${normalizeKey(category)}::${normalizeKey(name)}`;
}

/** Sanitize filename from dish name (ASCII, lowercase, max length). */
export function sanitizeFilename(name, maxLen = 80) {
  const slug = String(name || "item")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLen);
  return slug || "item";
}

/** Parse price from number or string like "₹120" / "120.00". */
export function parsePrice(value) {
  if (value == null) return null;
  if (typeof value === "number" && !Number.isNaN(value)) {
    return Math.round(value);
  }
  const str = String(value).replace(/[₹,\s]/g, "").trim();
  const match = str.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  return Math.round(parseFloat(match[1]));
}

/** Write JSON with pretty formatting. */
export async function writeJson(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

/** Print final scrape summary. */
export function printSummary(stats) {
  info("--- Scrape Summary ---");
  info(`Categories: ${stats.categories}`);
  info(`Items: ${stats.items}`);
  info(
    `Images downloaded: ${stats.imagesDownloaded}` +
      (stats.imagesFailed ? ` (${stats.imagesFailed} failed)` : "")
  );
  info(`Raw API response: ${path.relative(ROOT_DIR, RAW_MENU_PATH)}`);
  info(`Outputs: ${path.relative(ROOT_DIR, MENU_PATH)}, ${path.relative(ROOT_DIR, WEBSITE_MENU_PATH)}`);
  info(`Duration: ${stats.durationSec}s`);
  if (stats.source) {
    info(`Primary data source: ${stats.source}`);
  }
}
