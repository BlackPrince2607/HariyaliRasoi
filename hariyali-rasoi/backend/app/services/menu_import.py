"""Import Hariyali Rasoi menu data from JSON seed files."""
from __future__ import annotations

import json
from decimal import Decimal
from pathlib import Path
from typing import Any
from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from slugify import slugify

from app.models.category import Category
from app.models.menu_image import MenuImage
from app.models.menu_item import MenuItem

DEFAULT_SEED_PATH = Path(__file__).resolve().parents[2] / "seed" / "menu.json"


def load_menu_seed(path: Path | str = DEFAULT_SEED_PATH) -> dict[str, Any]:
    seed_path = Path(path)
    if not seed_path.exists():
        raise FileNotFoundError(f"Menu seed file not found: {seed_path}")
    return json.loads(seed_path.read_text(encoding="utf-8"))


def _unique_slug(base: str, existing: set[str]) -> str:
    slug = slugify(base)
    if slug not in existing:
        return slug
    i = 2
    while f"{slug}-{i}" in existing:
        i += 1
    return f"{slug}-{i}"


async def import_menu_seed(
    db: AsyncSession,
    data: dict[str, Any],
    *,
    replace_existing: bool = False,
) -> dict[str, int]:
    """Import categories and menu items from seed JSON.

    When replace_existing is True, all menu items and categories are removed first.
    Items are upserted by slug when replace_existing is False.
    """
    if replace_existing:
        await db.execute(delete(MenuImage))
        await db.execute(delete(MenuItem))
        await db.execute(delete(Category))

    category_by_slug: dict[str, Category] = {}
    result = await db.execute(select(Category))
    for category in result.scalars().all():
        category_by_slug[category.slug] = category

    categories_created = 0
    categories_updated = 0
    for cat_data in data.get("categories", []):
        slug = cat_data["slug"]
        existing = category_by_slug.get(slug)
        if existing:
            existing.name = cat_data["name"]
            existing.display_order = cat_data.get("display_order", 0)
            existing.is_active = cat_data.get("is_active", True)
            if cat_data.get("description"):
                existing.description = cat_data["description"]
            categories_updated += 1
        else:
            category = Category(
                name=cat_data["name"],
                slug=slug,
                description=cat_data.get("description"),
                display_order=cat_data.get("display_order", 0),
                is_active=cat_data.get("is_active", True),
            )
            db.add(category)
            category_by_slug[slug] = category
            categories_created += 1

    await db.flush()

    result = await db.execute(select(MenuItem.slug))
    existing_slugs = {row[0] for row in result.all()}
    slug_to_item: dict[str, MenuItem] = {}
    if not replace_existing:
        result = await db.execute(select(MenuItem))
        for item in result.scalars().all():
            slug_to_item[item.slug] = item

    items_created = 0
    items_updated = 0
    for item_data in data.get("items", []):
        category_slug = item_data.get("category_slug")
        category_id = None
        if category_slug and category_slug in category_by_slug:
            category_id = category_by_slug[category_slug].id

        slug = item_data.get("slug") or _unique_slug(item_data["name"], existing_slugs)
        existing_slugs.add(slug)

        fields = {
            "name": item_data["name"],
            "slug": slug,
            "description": item_data.get("description"),
            "price": Decimal(str(item_data["price"])),
            "original_price": (
                Decimal(str(item_data["original_price"]))
                if item_data.get("original_price") is not None
                else None
            ),
            "category_id": category_id,
            "tags": item_data.get("tags") or [],
            "is_veg": item_data.get("is_veg", True),
            "is_available": item_data.get("is_available", True),
            "is_out_of_stock": item_data.get("is_out_of_stock", False),
            "is_bestseller": item_data.get("is_bestseller", False),
            "is_new": item_data.get("is_new", False),
            "is_todays_special": item_data.get("is_todays_special", False),
            "preparation_time": item_data.get("preparation_time", 30),
            "display_order": item_data.get("display_order", 0),
        }

        existing_item = slug_to_item.get(slug)
        if existing_item:
            for key, value in fields.items():
                setattr(existing_item, key, value)
            items_updated += 1
        else:
            db.add(MenuItem(**fields))
            items_created += 1

    await db.commit()
    return {
        "categories_created": categories_created,
        "categories_updated": categories_updated,
        "items_created": items_created,
        "items_updated": items_updated,
        "total_items": len(data.get("items", [])),
    }
