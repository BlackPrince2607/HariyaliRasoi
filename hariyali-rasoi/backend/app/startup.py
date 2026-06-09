"""Application startup tasks."""
import logging

from sqlalchemy import func, select

from app.database import AsyncSessionLocal
from app.models.menu_item import MenuItem
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
