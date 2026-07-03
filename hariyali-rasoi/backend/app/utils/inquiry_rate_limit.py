from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.bhandara_request import BhandaraRequest
from app.models.catering_request import CateringRequest
from app.models.ngo_request import NgoRequest


async def check_inquiry_rate_limit(db: AsyncSession, phone: str, max_per_hour: int = 5) -> bool:
    """Limit inquiry submissions per phone across all inquiry types."""
    one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
    total = 0
    for model in (BhandaraRequest, NgoRequest, CateringRequest):
        n = await db.scalar(
            select(func.count())
            .select_from(model)
            .where(model.phone == phone, model.created_at >= one_hour_ago)
        )
        total += n or 0
    return total < max_per_hour
