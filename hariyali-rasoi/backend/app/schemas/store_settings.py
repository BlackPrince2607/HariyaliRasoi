from pydantic import BaseModel, ConfigDict
from uuid import UUID
from decimal import Decimal
from typing import Optional
from datetime import datetime, time


class StoreSettingsUpdate(BaseModel):
    is_open: Optional[bool] = None
    store_name: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    google_maps_url: Optional[str] = None
    opening_time: Optional[time] = None
    closing_time: Optional[time] = None
    lunch_start: Optional[time] = None
    lunch_end: Optional[time] = None
    dinner_start: Optional[time] = None
    dinner_end: Optional[time] = None
    delivery_fee: Optional[Decimal] = None
    free_delivery_threshold: Optional[Decimal] = None
    min_order_amount: Optional[Decimal] = None
    upi_id: Optional[str] = None
    upi_qr_url: Optional[str] = None
    closed_message: Optional[str] = None
    whatsapp_greeting: Optional[str] = None


class StoreSettingsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    is_open: bool
    store_name: str
    phone: Optional[str]
    whatsapp: Optional[str]
    email: Optional[str]
    address: Optional[str]
    google_maps_url: Optional[str]
    opening_time: Optional[time]
    closing_time: Optional[time]
    lunch_start: Optional[time]
    lunch_end: Optional[time]
    dinner_start: Optional[time]
    dinner_end: Optional[time]
    delivery_fee: Decimal
    free_delivery_threshold: Decimal
    min_order_amount: Decimal
    upi_id: Optional[str]
    upi_qr_url: Optional[str]
    closed_message: str
    whatsapp_greeting: Optional[str] = None
    updated_at: Optional[datetime]


class StoreToggleResponse(BaseModel):
    is_open: bool
