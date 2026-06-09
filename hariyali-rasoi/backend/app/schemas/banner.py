from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional
from datetime import datetime


class BannerCreate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    image_url: str
    link_url: Optional[str] = None
    is_active: bool = True
    display_order: int = 0
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None


class BannerUpdate(BannerCreate):
    pass


class BannerOut(BannerCreate):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    created_at: datetime
