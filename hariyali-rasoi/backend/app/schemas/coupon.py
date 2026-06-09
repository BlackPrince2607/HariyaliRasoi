from pydantic import BaseModel, ConfigDict, field_validator
from uuid import UUID
from decimal import Decimal
from typing import Optional
from datetime import datetime


class CouponCreate(BaseModel):
    code: str
    type: str
    value: Decimal
    min_order_amount: Decimal = Decimal("0")
    max_uses: Optional[int] = None
    is_active: bool = True
    expires_at: Optional[datetime] = None

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        if v not in ("percentage", "fixed"):
            raise ValueError("Type must be 'percentage' or 'fixed'")
        return v


class CouponUpdate(CouponCreate):
    pass


class CouponOut(CouponCreate):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    used_count: int
    created_at: datetime


class CouponValidateRequest(BaseModel):
    code: str
    subtotal: Decimal


class CouponValidateResponse(BaseModel):
    valid: bool
    discount_amount: Decimal = Decimal("0")
    message: str
