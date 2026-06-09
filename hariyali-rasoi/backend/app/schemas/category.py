from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional
from datetime import datetime


class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    display_order: int = 0
    is_active: bool = True


class CategoryUpdate(CategoryCreate):
    pass


class CategoryOut(CategoryCreate):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    slug: str
    created_at: datetime
