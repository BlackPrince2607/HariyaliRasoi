from datetime import datetime, timedelta, timezone
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.order import Order


async def check_order_rate_limit(db: AsyncSession, phone: str, max_orders: int = 3) -> bool:
    one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
    count = await db.scalar(
        select(func.count())
        .select_from(Order)
        .where(Order.customer_phone == phone, Order.created_at >= one_hour_ago)
    )
    return (count or 0) < max_orders
