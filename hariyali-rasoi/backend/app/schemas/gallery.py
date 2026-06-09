from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional
from datetime import datetime


class GalleryCreate(BaseModel):
    url: str
    alt: Optional[str] = None
    album: str = "food"
    display_order: int = 0


class GalleryUpdate(GalleryCreate):
    pass


class GalleryOut(GalleryCreate):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    created_at: datetime
