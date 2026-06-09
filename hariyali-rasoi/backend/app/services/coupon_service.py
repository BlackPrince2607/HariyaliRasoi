from decimal import Decimal
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.coupon import Coupon


async def validate_coupon(
    db: AsyncSession, code: str, subtotal: Decimal
) -> tuple[bool, Decimal, str, Coupon | None]:
    result = await db.execute(
        select(Coupon).where(Coupon.code == code.upper(), Coupon.is_active == True)  # noqa: E712
    )
    coupon = result.scalar_one_or_none()

    if not coupon:
        return False, Decimal("0"), "Invalid coupon code", None

    if coupon.expires_at and coupon.expires_at < datetime.now(timezone.utc):
        return False, Decimal("0"), "Coupon has expired", None

    if coupon.max_uses is not None and coupon.used_count >= coupon.max_uses:
        return False, Decimal("0"), "Coupon usage limit reached", None

    if subtotal < coupon.min_order_amount:
        return (
            False,
            Decimal("0"),
            f"Minimum order amount of ₹{coupon.min_order_amount} required",
            None,
        )

    if coupon.type == "percentage":
        discount = (subtotal * coupon.value / Decimal("100")).quantize(Decimal("0.01"))
    else:
        discount = min(coupon.value, subtotal)

    return True, discount, "Coupon applied successfully", coupon
