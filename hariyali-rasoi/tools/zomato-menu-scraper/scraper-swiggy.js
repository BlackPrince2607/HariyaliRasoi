#!/usr/bin/env node
/**
 * Swiggy Menu Scraper for Hariyali Rasoi.
 * Captures /dapi/menu/pl response via stealth Playwright session.
 */
import fs from "fs/promises";
import path from "path";
import { chromium } from "playwright";
import { parseSwiggyResponse, groupSwiggyItems } from "./lib/swiggy.js";
import { downloadAllImages, resetFilenameCache } from "./lib/images.js";
import {
  RESTAURANT_NAME,
  ensureDirs,
  writeJson,
  info,
  warn,
  error,
  printSummary,
  ROOT_DIR,
} from "./lib/utils.js";

const SWIGGY_URL =
  process.env.SWIGGY_URL ||
  "https://www.swiggy.com/city/kolkata/hariyali-rasoi-rajarhat-bishnupur-chinar-park-rest645341";

const OUTPUT_DIR = path.join(ROOT_DIR, "output");
const RAW_PATH = path.join(OUTPUT_DIR, "raw-swiggy-response.json");
const MENU_PATH = path.join(OUTPUT_DIR, "swiggy-menu.json");
const WEBSITE_PATH = path.join(OUTPUT_DIR, "swiggy-menu-for-website.json");

const HEADLESS = process.env.HEADLESS === "1";
const NAV_TIMEOUT = Number(process.env.TIMEOUT || 120000);

async function launchStealthBrowser() {
  const browser = await chromium.launch({
    headless: HEADLESS,
    args: ["--disable-blink-features=AutomationControlled"],
  });
  const context = await browser.newContext({
    viewport: { width: 1366, height: 900 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    locale: "en-IN",
    timezoneId: "Asia/Kolkata",
    extraHTTPHeaders: { "Accept-Language": "en-IN,en;q=0.9" },
  });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
  });
  return { browser, context };
}

async function captureSwiggyMenu(page) {
  let menuJson = null;
  let menuUrl = null;

  const handler = async (response) => {
    if (!response.url().includes("/dapi/menu/pl")) return;
    try {
      const json = await response.json();
      const size = JSON.stringify(json).length;
      if (size > 10000) {
        menuJson = json;
        menuUrl = response.url();
      }
    } catch {
      // ignore
    }
  };

  page.on("response", handler);

  info(`Navigating to Swiggy: ${SWIGGY_URL}`);
  await page.goto(SWIGGY_URL, { waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT });

  for (let i = 0; i < 25 && !menuJson; i++) {
    await page.waitForTimeout(1000);
  }

  if (!menuJson) {
    warn("Scrolling to trigger menu API...");
    for (let i = 0; i < 8; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await page.waitForTimeout(800);
    }
    await page.waitForTimeout(5000);
  }

  page.off("response", handler);

  return { menuJson, menuUrl };
}

async function main() {
  const start = Date.now();
  resetFilenameCache();
  await ensureDirs();

  info("Starting Swiggy menu scraper...");
  let browser;

  try {
    const { browser: b, context } = await launchStealthBrowser();
    browser = b;
    const page = await context.newPage();

    let { menuJson, menuUrl } = await captureSwiggyMenu(page);

    if (!menuJson) {
      error("Failed to capture Swiggy menu API. Swiggy may have blocked the request.");
      process.exitCode = 1;
      return;
    }

    await writeJson(RAW_PATH, {
      capturedAt: new Date().toISOString(),
      url: menuUrl,
      data: menuJson,
    });
    info(`Saved raw Swiggy response → ${RAW_PATH}`);

    const items = parseSwiggyResponse(menuJson);
    if (items.length === 0) {
      error("No items parsed from Swiggy JSON.");
      process.exitCode = 1;
      return;
    }

    info(`Parsed ${items.length} items from Swiggy API.`);

    info("Downloading dish images...");
    const imageStats = await downloadAllImages(items);

    const categories = groupSwiggyItems(items);
    const menuOut = {
      restaurant: RESTAURANT_NAME,
      source: "swiggy",
      scrapedAt: new Date().toISOString(),
      categories: categories.map((c) => ({
        name: c.name,
        items: c.items.map((i) => ({
          name: i.name,
          price: i.price,
          description: i.description,
          veg: i.veg,
          imageUrl: i.imageUrl,
          localImage: i.localImage || "",
        })),
      })),
    };

    await writeJson(MENU_PATH, menuOut);

    const flat = items.map((i) => ({
      name: i.name,
      price: i.price,
      category: i.category,
      image: i.localImage || i.imageUrl,
      description: i.description,
    }));
    await writeJson(WEBSITE_PATH, flat);

    const durationSec = Math.round((Date.now() - start) / 1000);
    printSummary({
      categories: categories.length,
      items: items.length,
      imagesDownloaded: imageStats.downloaded,
      imagesFailed: imageStats.failed,
      durationSec,
      source: "swiggy-api",
    });

    info(`Swiggy menu → ${MENU_PATH}`);
    await context.close();
  } catch (err) {
    error("Fatal:", err.message);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
  }
}

main();
