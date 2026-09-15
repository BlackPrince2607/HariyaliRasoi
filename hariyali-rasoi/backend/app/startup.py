"""Application startup tasks."""
import logging

from sqlalchemy import func, select

from app.config import settings
from app.database import AsyncSessionLocal
from app.models.menu_item import MenuItem
from app.models.store_settings import StoreSettings
from app.services.menu_import import import_menu_seed, load_menu_seed

logger = logging.getLogger(__name__)


async def seed_menu_if_empty() -> None:
    """Load production menu seed when the database has no menu items."""
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(func.count()).select_from(MenuItem))
        count = result.scalar_one()
        if count > 0:
            return

        logger.info("Menu is empty — importing production seed...")
        data = load_menu_seed()
        result = await import_menu_seed(db, data, replace_existing=True)
        logger.info("Menu seed imported: %s", result)


PLACEHOLDER_WHATSAPP = {"919999999999", "9999999999", "99999999999"}


def _is_placeholder_whatsapp(value: str | None) -> bool:
    if not value:
        return True
    digits = "".join(c for c in value if c.isdigit())
    return digits in PLACEHOLDER_WHATSAPP


async def sync_store_contact_from_env() -> None:
    """Backfill store contact fields from env when the DB row is empty or placeholder."""
    if not settings.whatsapp_number:
        return

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(StoreSettings).limit(1))
        store = result.scalar_one_or_none()
        if not store or not _is_placeholder_whatsapp(store.whatsapp):
            return

        store.whatsapp = settings.whatsapp_number
        await db.commit()
        logger.info("Store WhatsApp synced from WHATSAPP_NUMBER env")


async def ensure_store_hours() -> None:
    """Keep public hours at 8 AM – 10 PM when still on legacy defaults."""
    from datetime import time as dt_time

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(StoreSettings).limit(1))
        store = result.scalar_one_or_none()
        if not store:
            return

        legacy_open = store.opening_time in (None, dt_time(9, 0))
        legacy_close = store.closing_time in (None, dt_time(21, 0))
        if not (legacy_open or legacy_close):
            return

        store.opening_time = dt_time(8, 0)
        store.closing_time = dt_time(22, 0)
        await db.commit()
        logger.info("Store hours set to 08:00–22:00")
