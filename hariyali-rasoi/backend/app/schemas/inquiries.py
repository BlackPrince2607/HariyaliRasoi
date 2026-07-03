from pydantic import BaseModel, ConfigDict, field_validator
from uuid import UUID
from typing import Optional, Literal
from datetime import date, datetime
import re


def clean_phone(v: str) -> str:
    cleaned = re.sub(r"\D", "", v)
    if len(cleaned) not in (10, 12):
        raise ValueError("Invalid Indian phone number")
    return cleaned


class BhandaraRequestCreate(BaseModel):
    name: str
    phone: str
    event_date: date
    guest_count: int
    food_requirements: Optional[str] = None
    budget: Optional[str] = None

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        return clean_phone(v)


class BhandaraRequestOut(BhandaraRequestCreate):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    status: str
    notes: Optional[str]
    created_at: datetime


class NgoRequestCreate(BaseModel):
    name: str
    organization: str
    phone: str
    required_date: date
    quantity_needed: Optional[int] = None
    notes: Optional[str] = None

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        return clean_phone(v)


class NgoRequestOut(NgoRequestCreate):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    status: str
    created_at: datetime


class CateringRequestCreate(BaseModel):
    name: str
    phone: str
    event_type: str
    event_date: date
    guest_count: int
    budget: Optional[str] = None
    notes: Optional[str] = None

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        return clean_phone(v)


class CateringRequestOut(CateringRequestCreate):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    status: str
    created_at: datetime


class InquiryStatusUpdate(BaseModel):
    status: Literal["new", "contacted", "confirmed", "closed"]
    notes: Optional[str] = None
