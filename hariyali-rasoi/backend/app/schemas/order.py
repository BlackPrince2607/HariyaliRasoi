from pydantic import BaseModel, ConfigDict, field_validator
from uuid import UUID
from decimal import Decimal
from typing import Optional
from datetime import datetime
import re


class OrderItemCreate(BaseModel):
    menu_item_id: UUID
    quantity: int

    @field_validator("quantity")
    @classmethod
    def validate_quantity(cls, v: int) -> int:
        if v < 1 or v > 50:
            raise ValueError("Quantity must be between 1 and 50")
        return v


class OrderCreate(BaseModel):
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = None
    delivery_address: str
    order_notes: Optional[str] = None
    payment_method: str
    coupon_code: Optional[str] = None
    items: list[OrderItemCreate]

    @field_validator("customer_phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        cleaned = re.sub(r"\D", "", v)
        # Common Indian formats: 09876543210 or 0XXXXXXXXXX
        if len(cleaned) == 11 and cleaned.startswith("0"):
            cleaned = cleaned[1:]
        if len(cleaned) == 10:
            return cleaned
        if len(cleaned) == 12 and cleaned.startswith("91"):
            return cleaned
        raise ValueError("Invalid Indian phone number")

    @field_validator("payment_method")
    @classmethod
    def validate_payment_method(cls, v: str) -> str:
        if v not in ("cod", "upi"):
            raise ValueError("Payment method must be 'cod' or 'upi'")
        return v


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    menu_item_id: Optional[UUID]
    name: str
    price: Decimal
    quantity: int
    subtotal: Decimal


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    order_number: str
    customer_name: str
    customer_phone: str
    customer_email: Optional[str]
    delivery_address: str
    order_notes: Optional[str]
    payment_method: str
    payment_status: str
    payment_screenshot_url: Optional[str]
    status: str
    subtotal: Decimal
    discount: Decimal
    delivery_fee: Decimal
    total: Decimal
    coupon_code: Optional[str]
    created_at: datetime
    items: list[OrderItemOut] = []


class OrderStatusUpdate(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = ("pending", "accepted", "preparing", "ready", "delivered", "rejected")
        if v not in allowed:
            raise ValueError(f"Status must be one of: {', '.join(allowed)}")
        return v


class PaymentVerifyUpdate(BaseModel):
    payment_status: str = "paid"
