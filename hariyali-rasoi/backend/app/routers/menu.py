import json
from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import func, select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from slugify import slugify
from app.database import get_db
from app.dependencies import get_current_admin
from app.models.menu_item import MenuItem
from app.models.menu_image import MenuImage
from app.schemas.menu_item import (
    MenuItemCreate,
    MenuItemUpdate,
    MenuItemOut,
    MenuImageCreate,
    ReorderRequest,
    MenuImportRequest,
    MenuImportResult,
)
from app.schemas.auth import AdminUser
from app.services.menu_import import import_menu_seed, load_menu_seed

router = APIRouter()


async def _get_menu_item(db: AsyncSession, item_id: UUID) -> MenuItem:
    result = await db.execute(
        select(MenuItem).options(selectinload(MenuItem.images)).where(MenuItem.id == item_id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return item


def _unique_slug(base: str, existing_slugs: set[str]) -> str:
    slug = slugify(base)
    if slug not in existing_slugs:
        return slug
    i = 2
    while f"{slug}-{i}" in existing_slugs:
        i += 1
    return f"{slug}-{i}"


@router.get("", response_model=list[MenuItemOut])
async def list_menu_items(
    category_id: Optional[UUID] = None,
    is_veg: Optional[bool] = None,
    is_available: Optional[bool] = None,
    is_bestseller: Optional[bool] = None,
    is_todays_special: Optional[bool] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(MenuItem).options(selectinload(MenuItem.images))

    if category_id:
        query = query.where(MenuItem.category_id == category_id)
    if is_veg is not None:
        query = query.where(MenuItem.is_veg == is_veg)
    if is_available is not None:
        query = query.where(MenuItem.is_available == is_available)
    if is_bestseller is not None:
        query = query.where(MenuItem.is_bestseller == is_bestseller)
    if is_todays_special is not None:
        query = query.where(MenuItem.is_todays_special == is_todays_special)
    if search:
        query = query.where(
            or_(
                MenuItem.name.ilike(f"%{search}%"),
                MenuItem.description.ilike(f"%{search}%"),
                func.array_to_string(MenuItem.tags, ",").ilike(f"%{search}%"),
            )
        )

    query = query.order_by(MenuItem.display_order, MenuItem.name)
    result = await db.execute(query)
    return result.scalars().unique().all()


@router.get("/{item_id}", response_model=MenuItemOut)
async def get_menu_item(item_id: UUID, db: AsyncSession = Depends(get_db)):
    return await _get_menu_item(db, item_id)


@router.post("", response_model=MenuItemOut, status_code=201)
async def create_menu_item(
    data: MenuItemCreate,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    result = await db.execute(select(MenuItem.slug))
    existing = {row[0] for row in result.all()}
    slug = _unique_slug(data.name, existing)

    item = MenuItem(**data.model_dump(), slug=slug)
    db.add(item)
    await db.commit()
    return await _get_menu_item(db, item.id)


@router.put("/{item_id}", response_model=MenuItemOut)
async def update_menu_item(
    item_id: UUID,
    data: MenuItemUpdate,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    item = await _get_menu_item(db, item_id)
    result = await db.execute(select(MenuItem.slug).where(MenuItem.id != item_id))
    existing = {row[0] for row in result.all()}
    for key, value in data.model_dump().items():
        setattr(item, key, value)
    item.slug = _unique_slug(data.name, existing)
    await db.commit()
    return await _get_menu_item(db, item_id)


@router.delete("/{item_id}", status_code=204)
async def delete_menu_item(
    item_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    item = await _get_menu_item(db, item_id)
    await db.delete(item)
    await db.commit()


@router.patch("/{item_id}/toggle", response_model=MenuItemOut)
async def toggle_menu_item(
    item_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    item = await _get_menu_item(db, item_id)
    item.is_available = not item.is_available
    await db.commit()
    return await _get_menu_item(db, item_id)


@router.patch("/{item_id}/out-of-stock", response_model=MenuItemOut)
async def toggle_out_of_stock(
    item_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    item = await _get_menu_item(db, item_id)
    item.is_out_of_stock = not item.is_out_of_stock
    await db.commit()
    return await _get_menu_item(db, item_id)


@router.patch("/{item_id}/todays-special", response_model=MenuItemOut)
async def toggle_todays_special(
    item_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    item = await _get_menu_item(db, item_id)
    item.is_todays_special = not item.is_todays_special
    await db.commit()
    return await _get_menu_item(db, item_id)


@router.post("/import/seed", response_model=MenuImportResult)
async def import_default_seed(
    body: MenuImportRequest,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    data = load_menu_seed()
    return await import_menu_seed(db, data, replace_existing=body.replace_existing)


@router.post("/import", response_model=MenuImportResult)
async def import_menu_file(
    file: UploadFile = File(...),
    replace_existing: bool = False,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    if not file.filename or not file.filename.endswith(".json"):
        raise HTTPException(status_code=400, detail="Only JSON menu files are supported")

    try:
        raw = await file.read()
        data = json.loads(raw.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise HTTPException(status_code=400, detail=f"Invalid JSON file: {exc}") from exc

    if "categories" not in data or "items" not in data:
        raise HTTPException(
            status_code=400,
            detail="Menu file must contain 'categories' and 'items' arrays",
        )

    return await import_menu_seed(db, data, replace_existing=replace_existing)


@router.patch("/{item_id}/reorder")
async def reorder_menu_item(
    item_id: UUID,
    data: ReorderRequest,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    item = await _get_menu_item(db, item_id)
    item.display_order = data.display_order
    await db.commit()
    return {"success": True}


@router.post("/{item_id}/images", response_model=MenuItemOut)
async def add_menu_image(
    item_id: UUID,
    data: MenuImageCreate,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    await _get_menu_item(db, item_id)
    image = MenuImage(menu_item_id=item_id, **data.model_dump())
    db.add(image)
    await db.commit()
    return await _get_menu_item(db, item_id)


@router.delete("/{item_id}/images/{image_id}", status_code=204)
async def delete_menu_image(
    item_id: UUID,
    image_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    result = await db.execute(
        select(MenuImage).where(MenuImage.id == image_id, MenuImage.menu_item_id == item_id)
    )
    image = result.scalar_one_or_none()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    await db.delete(image)
    await db.commit()
