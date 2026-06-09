from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_admin
from app.models.coupon import Coupon
from app.schemas.coupon import (
    CouponCreate,
    CouponUpdate,
    CouponOut,
    CouponValidateRequest,
    CouponValidateResponse,
)
from app.schemas.auth import AdminUser
from app.services.coupon_service import validate_coupon

router = APIRouter()


@router.post("/validate", response_model=CouponValidateResponse)
async def validate_coupon_code(data: CouponValidateRequest, db: AsyncSession = Depends(get_db)):
    valid, discount, message, _ = await validate_coupon(db, data.code, data.subtotal)
    return CouponValidateResponse(valid=valid, discount_amount=discount, message=message)


@router.get("", response_model=list[CouponOut])
async def list_coupons(
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    result = await db.execute(select(Coupon).order_by(Coupon.created_at.desc()))
    return result.scalars().all()


@router.post("", response_model=CouponOut, status_code=201)
async def create_coupon(
    data: CouponCreate,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    coupon = Coupon(**data.model_dump(), code=data.code.upper())
    db.add(coupon)
    await db.commit()
    await db.refresh(coupon)
    return coupon


@router.put("/{coupon_id}", response_model=CouponOut)
async def update_coupon(
    coupon_id: UUID,
    data: CouponUpdate,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    result = await db.execute(select(Coupon).where(Coupon.id == coupon_id))
    coupon = result.scalar_one_or_none()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    for key, value in data.model_dump().items():
        setattr(coupon, key, value)
    coupon.code = data.code.upper()
    await db.commit()
    await db.refresh(coupon)
    return coupon


@router.delete("/{coupon_id}", status_code=204)
async def delete_coupon(
    coupon_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    result = await db.execute(select(Coupon).where(Coupon.id == coupon_id))
    coupon = result.scalar_one_or_none()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    await db.delete(coupon)
    await db.commit()
