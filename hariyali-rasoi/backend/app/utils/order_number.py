from datetime import date
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.order import Order


async def generate_order_number(db: AsyncSession) -> str:
    today = date.today()
    prefix = f"HR-{today.strftime('%Y%m%d')}"
    count = await db.scalar(
        select(func.count()).where(Order.order_number.like(f"{prefix}%"))
    )
    return f"{prefix}-{str((count or 0) + 1).zfill(4)}"
