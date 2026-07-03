/**
 * DOM interactions: dismiss modals, auto-scroll for lazy load, fallback menu extraction.
 */
import { parsePrice, info, warn } from "./utils.js";

const EXPAND_BUTTON_TEXTS = [
  "Show more",
  "View all",
  "See all",
  "Load more",
  "Read more",
];

const DISMISS_SELECTORS = [
  'button:has-text("Accept")',
  'button:has-text("Got it")',
  'button:has-text("Not now")',
  'button:has-text("Skip")',
  'button:has-text("Close")',
  '[aria-label="Close"]',
  '[data-testid="close-button"]',
];

/** Try to dismiss cookie/location overlays (non-fatal). */
export async function dismissOverlays(page) {
  for (const selector of DISMISS_SELECTORS) {
    try {
      const btn = page.locator(selector).first();
      if (await btn.isVisible({ timeout: 800 })) {
        await btn.click({ timeout: 1000 });
        info(`Dismissed overlay via: ${selector}`);
        await page.waitForTimeout(300);
      }
    } catch {
      // Overlay not present — continue
    }
  }
}

/** Wait for menu content shell to appear. */
export async function waitForMenuShell(page) {
  const selectors = [
    '[data-testid*="menu"]',
    'section[class*="menu"]',
    'div[class*="sc-"]',
    "h2",
    'img[src*="zomato"]',
  ];

  for (const sel of selectors) {
    try {
      await page.waitForSelector(sel, { timeout: 15000 });
      info(`Menu shell detected: ${sel}`);
      return;
    } catch {
      // try next
    }
  }
  warn("Menu shell not detected with known selectors — continuing anyway.");
}

/** Click expandable "show more" controls if present. */
export async function expandSections(page) {
  for (const text of EXPAND_BUTTON_TEXTS) {
    try {
      const buttons = page.getByRole("button", { name: new RegExp(text, "i") });
      const count = await buttons.count();
      for (let i = 0; i < Math.min(count, 5); i++) {
        const btn = buttons.nth(i);
        if (await btn.isVisible({ timeout: 500 })) {
          await btn.click({ timeout: 1000 }).catch(() => {});
          await page.waitForTimeout(400);
        }
      }
    } catch {
      // continue
    }
  }
}

/**
 * Auto-scroll the page to trigger lazy-loaded menu sections and images.
 * Stops when scroll height stabilizes or max iterations reached.
 */
export async function autoScrollPage(page, options = {}) {
  const maxIterations = options.maxIterations ?? 60;
  const pauseMs = options.pauseMs ?? 400;
  const stableThreshold = options.stableThreshold ?? 3;

  info("Auto-scrolling to load lazy menu content...");

  let stableCount = 0;
  let lastHeight = 0;

  for (let i = 0; i < maxIterations; i++) {
    const { scrollHeight, viewportHeight, scrollY } = await page.evaluate(() => ({
      scrollHeight: document.documentElement.scrollHeight,
      viewportHeight: window.innerHeight,
      scrollY: window.scrollY,
    }));

    if (scrollHeight === lastHeight) {
      stableCount++;
    } else {
      stableCount = 0;
      lastHeight = scrollHeight;
    }

    if (stableCount >= stableThreshold) {
      info(`Scroll complete after ${i + 1} passes (height stable).`);
      break;
    }

    await page.evaluate((vh) => {
      window.scrollBy(0, vh * 0.85);
    }, viewportHeight);

    await page.waitForTimeout(pauseMs);

    // Reached bottom
    if (scrollY + viewportHeight >= scrollHeight - 20) {
      await expandSections(page);
      await page.waitForTimeout(pauseMs);
    }
  }

  // Scroll back to top for consistent DOM reads (optional)
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
}

/**
 * Extract Hariyali Rasoi menu from Zomato order page DOM.
 * Zomato often hides per-item prices when closed; prices are merged from seed later.
 */
export async function extractMenuFromDom(page) {
  info("Running Zomato DOM menu extraction...");

  const raw = await page.evaluate(() => {
    const SKIP_LINES = new Set([
      "Order Online",
      "Currently closed for online ordering",
      "Search within menu",
      "Live tracking not available",
      "Online ordering is only supported on the mobile app",
      "Download the App",
      "Menu",
      "Overview",
      "Reviews",
      "Photos",
      "Search",
      "Continue",
    ]);

    const lines = document.body.innerText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    // Category names from sidebar e.g. "Sweets (2)"
    const categoryCounts = {};
    for (const line of lines) {
      const m = line.match(/^(.+?) \((\d+)\)$/);
      if (m && !line.includes("Your Order") && !line.includes("Dining Ratings")) {
        categoryCounts[m[1]] = Number(m[2]);
      }
    }
    const categoryNames = Object.keys(categoryCounts);

    // Dish images keyed by alt text (item name)
    const imageByName = {};
    document.querySelectorAll('img[src*="dish_photos"], img[src*="zmtcdn"]').forEach((img) => {
      const alt = (img.alt || "").trim();
      if (alt && alt !== "image" && alt !== "Zomato" && alt.length > 2) {
        imageByName[alt] = img.src.split("?")[0];
      }
    });

    let startIdx = lines.findIndex((l) => l === "Download the App");
    if (startIdx < 0) {
      startIdx = lines.findIndex((l) => categoryNames.includes(l));
    }
    if (startIdx < 0) startIdx = 0;

    const items = [];
    let currentCategory = "Uncategorized";
    let pending = null;

    const isCategoryHeader = (line) => categoryNames.includes(line);
    const isStopLine = (line) =>
      line.startsWith("Lic. No.") ||
      line.startsWith("Related to") ||
      line.startsWith("Restaurants in") ||
      line.startsWith("Frequent searches");

    const isDescriptionLine = (line) =>
      line.length > 45 ||
      line.endsWith("read more") ||
      /^[a-z]/.test(line) ||
      /^(it is|if you|are indian|we prepared|made with|refreshing drink|celebration of|or kairi|is a long|is the perfect|oldest smoothie|lemon,masala)/i.test(line);

    const isItemLine = (line) => {
      if (isCategoryHeader(line) || isStopLine(line) || SKIP_LINES.has(line)) return false;
      if (/^Your Order|^Subtotal:/.test(line)) return false;
      if (isDescriptionLine(line)) return false;
      return line.length >= 2 && line.length <= 120;
    };

    const pushPending = () => {
      if (pending) {
        items.push(pending);
        pending = null;
      }
    };

    for (let i = startIdx + 1; i < lines.length; i++) {
      const line = lines[i];
      if (isStopLine(line)) break;
      if (SKIP_LINES.has(line)) continue;
      if (/^Your Order \(\d+\)$/.test(line)) continue;
      if (/^Subtotal:/.test(line)) continue;

      if (isCategoryHeader(line)) {
        pushPending();
        currentCategory = line;
        continue;
      }

      if (pending && isDescriptionLine(line)) {
        pending.description = line
          .replace(/\s*\.{3}\s*read more\s*$/i, "")
          .replace(/\s*read more\s*$/i, "")
          .trim();
        items.push(pending);
        pending = null;
        continue;
      }

      if (!isItemLine(line)) continue;

      // New item line
      pushPending();
      pending = {
        name: line,
        category: currentCategory,
        description: "",
        imageUrl: imageByName[line] || "",
        veg: true,
      };
    }
    pushPending();

    return { items, categoryCounts, imageByName, categoryNames };
  });

  const normalized = raw.items
    .filter((item) => item.name && item.name.length >= 2 && item.name.length <= 200)
    .map((item) => ({
      name: item.name,
      price: 0,
      description: item.description || "",
      veg: item.veg !== false,
      category: item.category || "Uncategorized",
      imageUrl: item.imageUrl || "",
      source: "dom",
    }));

  const seen = new Set();
  const deduped = [];
  for (const item of normalized) {
    const key = `${item.category}::${item.name}`.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(item);
    }
  }

  info(
    `Zomato DOM extraction: ${deduped.length} items across ${raw.categoryNames?.length || 0} categories, ` +
      `${Object.keys(raw.imageByName || {}).length} images found.`
  );
  return deduped;
}
