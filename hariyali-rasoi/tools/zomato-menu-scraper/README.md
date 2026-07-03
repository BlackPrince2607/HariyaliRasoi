# Menu Scraper (Zomato + Swiggy)

One-time migration tool to extract Hariyali Rasoi menu data, prices, and images from Zomato and Swiggy.

## Swiggy (recommended — includes prices + full menu)

**Target:** [Hariyali Rasoi on Swiggy](https://www.swiggy.com/city/kolkata/hariyali-rasoi-rajarhat-bishnupur-chinar-park-rest645341)

```bash
cd hariyali-rasoi/tools/zomato-menu-scraper
npm install
npm run scrape:swiggy
npm run merge:swiggy
cd ../../backend
python scripts/import_menu.py --replace
```

Outputs:
- `output/swiggy-menu.json` — full menu with Swiggy prices
- `output/raw-swiggy-response.json` — raw API JSON
- `downloads/images/` — downloaded dish photos

## Zomato

**Target:** [Hariyali Rasoi on Zomato](https://www.zomato.com/kolkata/hariyali-rasoi-chinar-park/order)

Note: Zomato web often hides per-item prices when the outlet is closed. Use Swiggy for prices.

```bash
npm run scrape
npm run merge:zomato
```

## How it works

1. Opens the Zomato order page in Chromium (headed by default — better anti-bot pass rate).
2. **Captures menu JSON from network responses** (`/gw/menu`, `/webroutes`, etc.) — preferred over HTML scraping.
3. **Auto-scrolls** the full page to load lazy menu sections and images.
4. **DOM fallback** if network capture is incomplete.
5. **Downloads images** to `downloads/images/` with retry logic.
6. Writes structured JSON outputs.

## Output files

| File | Description |
|------|-------------|
| `output/menu.json` | Full menu grouped by category |
| `output/menu-for-website.json` | Flat array for website import |
| `output/raw-menu-response.json` | Raw Zomato API JSON (for debugging) |
| `downloads/images/` | Downloaded food photos |

### `menu.json` structure

```json
{
  "restaurant": "Hariyali Rasoi",
  "scrapedAt": "2026-06-09T12:00:00.000Z",
  "categories": [
    {
      "name": "Breakfast",
      "items": [
        {
          "name": "Item Name",
          "price": 120,
          "description": "",
          "veg": true,
          "imageUrl": "https://...",
          "localImage": "downloads/images/item-name.jpg"
        }
      ]
    }
  ]
}
```

### `menu-for-website.json` structure

```json
[
  {
    "name": "Item Name",
    "price": 120,
    "category": "Breakfast",
    "image": "downloads/images/item-name.jpg",
    "description": ""
  }
]
```

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `HEADLESS=1` | off | Run browser without visible window |
| `SLOW_MO=100` | 0 | Slow Playwright actions (ms) — useful for debugging |
| `TIMEOUT=90000` | 90000 | Page navigation timeout (ms) |

Example:

```bash
HEADLESS=1 node scraper.js
```

## Troubleshooting

### No items extracted / anti-bot block

- Run **without** `HEADLESS=1` so you can see what Zomato shows.
- Check `output/raw-menu-response.json` — if `data` is null, network capture failed.
- Retry after a few minutes; Zomato may rate-limit automated access.
- The scraper logs a warning if it detects captcha/access-denied pages.

### Missing images

- Re-run the scraper — existing images are **skipped** (idempotent).
- Failed downloads are logged; check image URLs in `menu.json`.

### Duplicate items

- The scraper dedupes by `category + name`. API data is preferred over DOM when both exist.

### Zomato changed their API

- Inspect `output/raw-menu-response.json` manually.
- Update heuristics in `lib/network.js` if needed.

## Import into Hariyali Rasoi backend

Your backend expects a different seed format (`categories[]` + flat `items[]` with `category_slug`, `is_veg`, etc.) in `backend/seed/menu.json`.

After scraping:

1. **Review** `output/menu.json` and images in `downloads/images/`.
2. **Upload images** to your storage (Supabase, S3, etc.) and update image paths.
3. **Convert** to backend seed format (manual or script) with fields like:

```json
{
  "categories": [{ "name": "Breakfast", "slug": "breakfast", "display_order": 1 }],
  "items": [{
    "name": "...",
    "slug": "...",
    "category_slug": "breakfast",
    "price": 120,
    "description": "...",
    "is_veg": true,
    "is_available": true,
    "preparation_time": 30,
    "display_order": 1
  }]
}
```

4. **Import** into the database:

```bash
cd hariyali-rasoi/backend
python scripts/import_menu.py --replace --file path/to/converted-menu.json
```

## Legal note

This tool is intended for **one-time migration of your own restaurant's menu** from Zomato to your website. Respect Zomato's terms of service. Do not use for repeated scraping or third-party data collection.

## Project structure

```
tools/zomato-menu-scraper/
├── scraper.js           # Entry point
├── package.json
├── lib/
│   ├── network.js       # XHR/Fetch capture + JSON parsing
│   ├── dom.js           # Scroll + DOM fallback
│   ├── images.js        # Image download + retry
│   ├── transform.js     # Dedupe + output shaping
│   └── utils.js         # Paths, logging, helpers
├── downloads/images/    # Downloaded images (gitignored)
└── output/              # JSON outputs (gitignored)
```
