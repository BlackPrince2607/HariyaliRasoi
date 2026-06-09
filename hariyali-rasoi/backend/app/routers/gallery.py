from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_admin
from app.models.gallery import Gallery
from app.schemas.gallery import GalleryCreate, GalleryUpdate, GalleryOut
from app.schemas.auth import AdminUser

router = APIRouter()


@router.get("", response_model=list[GalleryOut])
async def list_gallery(
    album: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(Gallery).order_by(Gallery.display_order)
    if album:
        query = query.where(Gallery.album == album)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=GalleryOut, status_code=201)
async def create_gallery_item(
    data: GalleryCreate,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    item = Gallery(**data.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.put("/{item_id}", response_model=GalleryOut)
async def update_gallery_item(
    item_id: UUID,
    data: GalleryUpdate,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    result = await db.execute(select(Gallery).where(Gallery.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Gallery item not found")
    for key, value in data.model_dump().items():
        setattr(item, key, value)
    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=204)
async def delete_gallery_item(
    item_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    result = await db.execute(select(Gallery).where(Gallery.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Gallery item not found")
    await db.delete(item)
    await db.commit()
