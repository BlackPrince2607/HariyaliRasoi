#!/usr/bin/env node
/**
 * Zomato Menu Scraper — one-time migration tool for Hariyali Rasoi.
 *
 * Strategy:
 *   1. Capture menu JSON from network (XHR/Fetch) — preferred
 *   2. Auto-scroll page to load lazy content
 *   3. DOM fallback extraction if network data is incomplete
 *   4. Download images with retries
 *   5. Write menu.json + menu-for-website.json
 *
 * Usage:
 *   npm install
 *   node scraper.js
 *
 * Environment:
 *   HEADLESS=1     Run browser headless (default: headed for anti-bot)
 *   SLOW_MO=100    Slow down Playwright actions (ms)
 *   TIMEOUT=60000  Navigation timeout (ms)
 */
import { chromium } from "playwright";
import {
  dismissOverlays,
  waitForMenuShell,
  autoScrollPage,
  extractMenuFromDom,
} from "./lib/dom.js";
import {
  createNetworkCapture,
  parseBestNetworkCapture,
  detectBlockedPage,
} from "./lib/network.js";
import { downloadAllImages, resetFilenameCache } from "./lib/images.js";
import {
  mergeItems,
  buildMenuJson,
  buildWebsiteMenuJson,
  countStats,
} from "./lib/transform.js";
import {
  TARGET_URL,
  ensureDirs,
  writeJson,
  RAW_MENU_PATH,
  MENU_PATH,
  WEBSITE_MENU_PATH,
  info,
  warn,
  error,
  printSummary,
} from "./lib/utils.js";

const HEADLESS = process.env.HEADLESS === "1";
const SLOW_MO = Number(process.env.SLOW_MO || 0);
const NAV_TIMEOUT = Number(process.env.TIMEOUT || 90000);

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

async function main() {
  const startTime = Date.now();
  resetFilenameCache();
  await ensureDirs();

  info("Starting Zomato menu scraper...");
  info(`Target: ${TARGET_URL}`);
  info(`Mode: ${HEADLESS ? "headless" : "headed"}`);

  let browser;
  let capture;

  try {
    browser = await chromium.launch({
      headless: HEADLESS,
      slowMo: SLOW_MO || undefined,
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      userAgent: USER_AGENT,
      locale: "en-IN",
      timezoneId: "Asia/Kolkata",
    });

    const page = await context.newPage();

    // Block fonts/media only — never block images or XHR
    await page.route("**/*", (route) => {
      const type = route.request().resourceType();
      if (type === "font" || type === "media") {
        route.abort();
      } else {
        route.continue();
      }
    });

    // Attach network listener BEFORE navigation
    capture = createNetworkCapture(page);

    info("Navigating to Zomato order page...");
    await page.goto(TARGET_URL, {
      waitUntil: "domcontentloaded",
      timeout: NAV_TIMEOUT,
    });

    // Wait for React hydration and initial API calls
    await page.waitForTimeout(3000);
    await dismissOverlays(page);
    await waitForMenuShell(page);

    // Check for anti-bot block
    const htmlSnippet = await page.content();
    if (detectBlockedPage(htmlSnippet)) {
      warn(
        "Page may be blocked by anti-bot protection. Will attempt network + DOM extraction anyway."
      );
      warn("Tip: run without HEADLESS=1, or retry after a few minutes.");
    }

    // Scroll to load all lazy sections and images
    await autoScrollPage(page);

    // Allow late network responses to settle
    await page.waitForTimeout(2000);

    // --- Network extraction (preferred) ---
    const bestCapture = capture.getBestCapture();
    let apiItems = parseBestNetworkCapture(bestCapture);

    if (bestCapture) {
      await writeJson(RAW_MENU_PATH, {
        capturedAt: new Date().toISOString(),
        url: bestCapture.url,
        itemCount: bestCapture.score,
        data: bestCapture.json,
      });
      info(`Saved raw API response → ${RAW_MENU_PATH}`);
    } else {
      warn("No raw menu JSON saved — network capture found no menu payloads.");
      // Save empty placeholder so user knows scrape ran
      await writeJson(RAW_MENU_PATH, {
        capturedAt: new Date().toISOString(),
        url: null,
        itemCount: 0,
        data: null,
        note: "No menu JSON captured from network. Check DOM extraction or anti-bot block.",
      });
    }

    // --- DOM fallback ---
    const domItems = await extractMenuFromDom(page);

    capture.detach();

    // --- Merge & dedupe (API preferred) ---
    let mergedItems = mergeItems(apiItems, domItems);

    if (mergedItems.length === 0) {
      error("No menu items extracted. Zomato may have blocked the scraper or changed their page structure.");
      error("Inspect the browser window (run headed) and check output/raw-menu-response.json.");
      process.exitCode = 1;
      return;
    }

    const source =
      apiItems.length > 0
        ? domItems.length > 0
          ? "network + dom"
          : "network"
        : "dom";

    info(`Merged ${mergedItems.length} unique items (source: ${source}).`);

    // --- Download images ---
    info("Downloading food images...");
    const imageStats = await downloadAllImages(mergedItems);

    // --- Write outputs ---
    const menuJson = buildMenuJson(mergedItems);
    // Remove internal _meta from user-facing file or keep — plan shows clean structure; strip _meta
    const { _meta, ...cleanMenuJson } = menuJson;
    await writeJson(MENU_PATH, cleanMenuJson);

    const websiteMenu = buildWebsiteMenuJson(mergedItems);
    await writeJson(WEBSITE_MENU_PATH, websiteMenu);

    const stats = countStats(menuJson);
    const durationSec = Math.round((Date.now() - startTime) / 1000);

    printSummary({
      categories: stats.categories,
      items: stats.items,
      imagesDownloaded: imageStats.downloaded,
      imagesFailed: imageStats.failed,
      durationSec,
      source,
    });

    await context.close();
  } catch (err) {
    error("Fatal error:", err.message);
    if (err.stack) console.error(err.stack);
    process.exitCode = 1;
  } finally {
    capture?.detach();
    if (browser) await browser.close();
  }
}

main();
