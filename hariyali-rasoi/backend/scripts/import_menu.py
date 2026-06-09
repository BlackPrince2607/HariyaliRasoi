"""CLI script to import Hariyali Rasoi menu seed data into the database.

Usage:
    python scripts/import_menu.py                  # merge/upsert default seed
    python scripts/import_menu.py --replace        # wipe menu & reimport
    python scripts/import_menu.py --file path.json # custom seed file
"""
from __future__ import annotations

import argparse
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.database import AsyncSessionLocal
from app.services.menu_import import DEFAULT_SEED_PATH, import_menu_seed, load_menu_seed


async def run(seed_file: Path, replace: bool) -> None:
    data = load_menu_seed(seed_file)
    async with AsyncSessionLocal() as db:
        result = await import_menu_seed(db, data, replace_existing=replace)
    print("Menu import complete:")
    for key, value in result.items():
        print(f"  {key}: {value}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Import Hariyali Rasoi menu seed data")
    parser.add_argument(
        "--file",
        type=Path,
        default=DEFAULT_SEED_PATH,
        help="Path to menu JSON seed file",
    )
    parser.add_argument(
        "--replace",
        action="store_true",
        help="Delete existing categories and menu items before import",
    )
    args = parser.parse_args()
    asyncio.run(run(args.file, args.replace))


if __name__ == "__main__":
    main()
