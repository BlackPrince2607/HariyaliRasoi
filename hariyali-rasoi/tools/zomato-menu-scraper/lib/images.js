/**
 * Download food images with sanitized filenames and retry logic.
 */
import fs from "fs/promises";
import path from "path";
import { IMAGES_DIR, sanitizeFilename, info, warn } from "./utils.js";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const MAX_RETRIES = 3;
const RETRY_DELAYS_MS = [1000, 2000, 4000];

/** Track used filenames to avoid collisions. */
const usedFilenames = new Set();

/**
 * Resolve a unique local filename for a dish.
 */
export function resolveLocalFilename(itemName, imageUrl) {
  const ext = extensionFromUrl(imageUrl);
  let base = sanitizeFilename(itemName);
  let filename = `${base}${ext}`;
  let counter = 2;

  while (usedFilenames.has(filename)) {
    filename = `${base}-${counter}${ext}`;
    counter++;
  }

  usedFilenames.add(filename);
  return filename;
}

function extensionFromUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    const ext = path.extname(pathname).toLowerCase();
    if ([".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext)) {
      return ext === ".jpeg" ? ".jpg" : ext;
    }
  } catch {
    // fall through
  }
  return ".jpg";
}

function extensionFromContentType(contentType) {
  if (!contentType) return ".jpg";
  if (contentType.includes("png")) return ".png";
  if (contentType.includes("webp")) return ".webp";
  if (contentType.includes("gif")) return ".gif";
  return ".jpg";
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Download a single image with retries. Returns relative path or empty string on failure.
 */
export async function downloadImage(imageUrl, itemName) {
  if (!imageUrl || !imageUrl.startsWith("http")) {
    return { localImage: "", success: false };
  }

  let filename = resolveLocalFilename(itemName, imageUrl);
  let filePath = path.join(IMAGES_DIR, filename);
  const relativePath = path.join("downloads", "images", filename).replace(/\\/g, "/");

  // Skip if already downloaded (idempotent re-runs)
  try {
    await fs.access(filePath);
    info(`Image exists, skipping: ${filename}`);
    return { localImage: relativePath, success: true, skipped: true };
  } catch {
    // proceed with download
  }

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const referer = imageUrl.includes("swiggy")
        ? "https://www.swiggy.com/"
        : "https://www.zomato.com/";
      const response = await fetch(imageUrl, {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
          Referer: referer,
        },
        redirect: "follow",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const contentType = response.headers.get("content-type") || "";
      const ext = extensionFromContentType(contentType);
      if (!filename.endsWith(ext)) {
        usedFilenames.delete(filename);
        filename = resolveLocalFilename(`${itemName}-${ext.replace(".", "")}`, imageUrl);
        if (!filename.endsWith(ext)) {
          filename = filename.replace(/\.[^.]+$/, ext);
        }
        filePath = path.join(IMAGES_DIR, filename);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      await fs.writeFile(filePath, buffer);

      const finalRelative = path.join("downloads", "images", filename).replace(/\\/g, "/");
      return { localImage: finalRelative, success: true };
    } catch (err) {
      const isLast = attempt === MAX_RETRIES - 1;
      if (isLast) {
        warn(`Failed to download image for "${itemName}": ${err.message}`);
        return { localImage: "", success: false };
      }
      await sleep(RETRY_DELAYS_MS[attempt] || 2000);
    }
  }

  return { localImage: "", success: false };
}

/**
 * Download images for all items; mutates items with localImage field.
 */
export async function downloadAllImages(items) {
  let downloaded = 0;
  let failed = 0;
  let skipped = 0;

  for (const item of items) {
    if (!item.imageUrl) {
      item.localImage = "";
      continue;
    }

    const result = await downloadImage(item.imageUrl, item.name);
    item.localImage = result.localImage;

    if (result.skipped) {
      skipped++;
      downloaded++;
    } else if (result.success) {
      downloaded++;
    } else {
      failed++;
    }
  }

  return { downloaded, failed, skipped };
}

/** Reset filename tracking (for tests / re-runs in same process). */
export function resetFilenameCache() {
  usedFilenames.clear();
}
