from pydantic import BaseModel, ConfigDict
from uuid import UUID
from decimal import Decimal
from typing import Optional
from datetime import datetime


class MenuImageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    url: str
    is_primary: bool
    display_order: int


class MenuItemCreate(BaseModel):
    name: str
    description: Optional[str] = None
    tags: list[str] = []
    price: Decimal
    original_price: Optional[Decimal] = None
    is_veg: bool = True
    is_available: bool = True
    is_out_of_stock: bool = False
    is_bestseller: bool = False
    is_new: bool = False
    is_todays_special: bool = False
    preparation_time: int = 30
    category_id: Optional[UUID] = None


class MenuItemUpdate(MenuItemCreate):
    pass


class MenuItemOut(MenuItemCreate):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    slug: str
    display_order: int
    created_at: datetime
    images: list[MenuImageOut] = []


class MenuImageCreate(BaseModel):
    url: str
    is_primary: bool = False
    display_order: int = 0


class ReorderRequest(BaseModel):
    display_order: int


class MenuImportRequest(BaseModel):
    replace_existing: bool = False


class MenuImportResult(BaseModel):
    categories_created: int
    categories_updated: int
    items_created: int
    items_updated: int
    total_items: int
