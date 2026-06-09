from uuid import UUID
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_admin
from app.models.banner import Banner
from app.schemas.banner import BannerCreate, BannerUpdate, BannerOut
from app.schemas.auth import AdminUser

router = APIRouter()


@router.get("", response_model=list[BannerOut])
async def list_banners(active_only: bool = True, db: AsyncSession = Depends(get_db)):
    query = select(Banner).order_by(Banner.display_order)
    if active_only:
        now = datetime.now(timezone.utc)
        query = query.where(
            Banner.is_active == True,  # noqa: E712
            or_(Banner.starts_at.is_(None), Banner.starts_at <= now),
            or_(Banner.ends_at.is_(None), Banner.ends_at >= now),
        )
    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=BannerOut, status_code=201)
async def create_banner(
    data: BannerCreate,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    banner = Banner(**data.model_dump())
    db.add(banner)
    await db.commit()
    await db.refresh(banner)
    return banner


@router.put("/{banner_id}", response_model=BannerOut)
async def update_banner(
    banner_id: UUID,
    data: BannerUpdate,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    result = await db.execute(select(Banner).where(Banner.id == banner_id))
    banner = result.scalar_one_or_none()
    if not banner:
        raise HTTPException(status_code=404, detail="Banner not found")
    for key, value in data.model_dump().items():
        setattr(banner, key, value)
    await db.commit()
    await db.refresh(banner)
    return banner


@router.delete("/{banner_id}", status_code=204)
async def delete_banner(
    banner_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    result = await db.execute(select(Banner).where(Banner.id == banner_id))
    banner = result.scalar_one_or_none()
    if not banner:
        raise HTTPException(status_code=404, detail="Banner not found")
    await db.delete(banner)
    await db.commit()
