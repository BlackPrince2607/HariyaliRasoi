from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_admin
from app.models.store_settings import StoreSettings
from app.schemas.store_settings import StoreSettingsUpdate, StoreSettingsOut, StoreToggleResponse
from app.schemas.auth import AdminUser

router = APIRouter()


async def _get_settings(db: AsyncSession) -> StoreSettings:
    result = await db.execute(select(StoreSettings).limit(1))
    settings = result.scalar_one_or_none()
    if not settings:
        raise HTTPException(status_code=500, detail="Store settings not configured")
    return settings


@router.get("/settings", response_model=StoreSettingsOut)
async def get_settings(db: AsyncSession = Depends(get_db)):
    return await _get_settings(db)


@router.put("/settings", response_model=StoreSettingsOut)
async def update_settings(
    data: StoreSettingsUpdate,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    settings = await _get_settings(db)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(settings, key, value)
    await db.commit()
    await db.refresh(settings)
    return settings


@router.patch("/toggle", response_model=StoreToggleResponse)
async def toggle_store(
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    settings = await _get_settings(db)
    settings.is_open = not settings.is_open
    await db.commit()
    return StoreToggleResponse(is_open=settings.is_open)
