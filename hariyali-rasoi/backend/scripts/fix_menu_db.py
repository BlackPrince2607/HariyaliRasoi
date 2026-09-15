"""Remove duplicate menu items and fill missing images without changing prices.

Usage:
    python scripts/fix_menu_db.py           # dry-run (report only)
    python scripts/fix_menu_db.py --apply   # apply changes
"""
from __future__ import annotations

import argparse
import asyncio
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import AsyncSessionLocal
from app.models.menu_image import MenuImage
from app.models.menu_item import MenuItem
from app.services.menu_import import DEFAULT_SEED_PATH, load_menu_seed

# duplicate slug → canonical slug to keep
DUPLICATE_SLUGS: dict[str, str] = {
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
}


def _normalize_name(name: str) -> str:
    n = name.lower()
    n = re.sub(r"\[[^\]]*\]", "", n)
    n = re.sub(r"\(\d+\s*pcs?\)", "", n, flags=re.I)
    n = re.sub(r"\(\d+\s*pc\)", "", n, flags=re.I)
    n = re.sub(r"[^a-z0-9\s]", " ", n)
    n = re.sub(r"\s+", " ", n).strip()
    return n.replace("chaat", "chat").replace("sandwhich", "sandwich")


def _seed_image_maps(seed: dict) -> tuple[dict[str, str], dict[str, str]]:
    by_slug: dict[str, str] = {}
    by_name: dict[str, str] = {}
    for item in seed.get("items", []):
        url = item.get("image_url")
        if not url:
            continue
        slug = item.get("slug")
        if slug:
            by_slug[slug] = url
        by_name[item["name"].lower().strip()] = url
        norm = _normalize_name(item["name"])
        if norm not in by_name:
            by_name[norm] = url
    return by_slug, by_name


def _pick_duplicate_to_remove(items: list[MenuItem]) -> MenuItem | None:
    """Choose which duplicate row to delete; keep the best canonical item."""
    if len(items) < 2:
        return None

    for item in items:
        if item.slug in DUPLICATE_SLUGS:
            return item

    # Prefer keeping slug without -2 / -3 suffix (import artifact)
    def sort_key(i: MenuItem) -> tuple:
        slug_penalty = 1 if re.search(r"-\d+$", i.slug) else 0
        return (slug_penalty, len(i.slug), i.slug)

    sorted_items = sorted(items, key=sort_key)
    return sorted_items[-1]  # delete worst candidate


def _resolve_image_url(
    item: MenuItem,
    by_slug: dict[str, str],
    by_name: dict[str, str],
) -> str | None:
    if item.slug in by_slug:
        return by_slug[item.slug]
    key = item.name.lower().strip()
    if key in by_name:
        return by_name[key]
    norm = _normalize_name(item.name)
    if norm in by_name:
        return by_name[norm]
    # strip -2 suffix and retry slug
    base_slug = re.sub(r"-\d+$", "", item.slug)
    if base_slug in by_slug:
        return by_slug[base_slug]
    return None


async def run(*, apply: bool) -> None:
    seed = load_menu_seed()
    by_slug, by_name = _seed_image_maps(seed)

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(MenuItem).options(selectinload(MenuItem.images))
        )
        items = list(result.scalars().unique().all())

        print(f"Loaded {len(items)} menu items from database")

        # --- dedupe by known slug map ---
        to_delete: set = set()
        by_slug_db = {i.slug: i for i in items}

        for dup_slug, canon_slug in DUPLICATE_SLUGS.items():
            if dup_slug in by_slug_db:
                to_delete.add(by_slug_db[dup_slug].id)
                print(f"  [dup-slug] remove: {by_slug_db[dup_slug].name} ({dup_slug})")

        # --- dedupe by exact name ---
        by_name_db: dict[str, list[MenuItem]] = {}
        for item in items:
            if item.id in to_delete:
                continue
            by_name_db.setdefault(item.name.lower().strip(), []).append(item)

        for name, group in by_name_db.items():
            if len(group) < 2:
                continue
            victim = _pick_duplicate_to_remove(group)
            if victim and victim.id not in to_delete:
                keep = next(i for i in group if i.id != victim.id)
                to_delete.add(victim.id)
                print(
                    f"  [dup-name] remove: {victim.name} ({victim.slug}, Rs{victim.price}) "
                    f"-> keep ({keep.slug}, Rs{keep.price})"
                )

        # --- fill missing images ---
        image_updates: list[tuple[MenuItem, str]] = []
        for item in items:
            if item.id in to_delete:
                continue
            if item.images:
                continue
            url = _resolve_image_url(item, by_slug, by_name)
            if url:
                image_updates.append((item, url))
            else:
                print(f"  [no-image] no match: {item.name} ({item.slug})")

        print("\n--- Summary ---")
        print(f"Duplicates to remove: {len(to_delete)}")
        print(f"Images to add: {len(image_updates)}")
        still_missing = sum(
            1
            for i in items
            if i.id not in to_delete and not i.images
        ) - len(image_updates)
        print(f"Still without image after fix: {still_missing}")

        if not apply:
            print("\nDry run only. Re-run with --apply to commit changes.")
            return

        for item_id in to_delete:
            item = next(i for i in items if i.id == item_id)
            await db.delete(item)

        for item, url in image_updates:
            db.add(
                MenuImage(
                    menu_item_id=item.id,
                    url=url,
                    is_primary=True,
                    display_order=0,
                )
            )

        await db.commit()
        print("\nChanges applied successfully.")


def main() -> None:
    parser = argparse.ArgumentParser(description="Fix menu duplicates and missing images")
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Apply changes (default is dry-run)",
    )
    args = parser.parse_args()
    asyncio.run(run(apply=args.apply))


if __name__ == "__main__":
    main()
