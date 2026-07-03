import re
from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.dependencies import get_current_admin
from app.models.order import Order
from app.schemas.order import (
    OrderCreate,
    OrderOut,
    OrderStatusUpdate,
    PaymentVerifyUpdate,
)
from app.schemas.auth import AdminUser
from app.services.order_service import (
    create_order,
    get_order_by_id,
    get_order_by_number_and_phone,
)
from app.services.upload_service import validate_image, upload_to_supabase

router = APIRouter()


@router.post("", response_model=OrderOut, status_code=201)
async def place_order(data: OrderCreate, db: AsyncSession = Depends(get_db)):
    order = await create_order(db, data)
    return order


@router.get("", response_model=list[OrderOut])
async def list_orders(
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    query = select(Order).options(selectinload(Order.items)).order_by(Order.created_at.desc())
    if status:
        query = query.where(Order.status == status)
    result = await db.execute(query)
    return result.scalars().unique().all()


@router.get("/lookup", response_model=OrderOut)
async def lookup_order(
    order_number: str,
    phone: str,
    db: AsyncSession = Depends(get_db),
):
    """Public confirmation lookup — requires matching order number and customer phone."""
    cleaned = re.sub(r"\D", "", phone)
    if len(cleaned) == 11 and cleaned.startswith("0"):
        cleaned = cleaned[1:]
    if len(cleaned) == 12 and cleaned.startswith("91"):
        cleaned = cleaned[2:]
    if len(cleaned) != 10:
        raise HTTPException(status_code=400, detail="Invalid phone number")

    order = await get_order_by_number_and_phone(db, order_number.strip(), cleaned)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.get("/{order_id}", response_model=OrderOut)
async def get_order(
    order_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    order = await get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.patch("/{order_id}/status", response_model=OrderOut)
async def update_order_status(
    order_id: UUID,
    data: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    order = await get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = data.status
    await db.commit()
    return await get_order_by_id(db, order_id)


@router.patch("/{order_id}/verify-payment", response_model=OrderOut)
async def verify_payment(
    order_id: UUID,
    data: PaymentVerifyUpdate,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    order = await get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.payment_status = data.payment_status
    await db.commit()
    return await get_order_by_id(db, order_id)


@router.post("/{order_id}/upload-screenshot")
async def upload_payment_screenshot(
    order_id: UUID,
    phone: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    order = await get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    cleaned = re.sub(r"\D", "", phone)
    if len(cleaned) == 11 and cleaned.startswith("0"):
        cleaned = cleaned[1:]
    if len(cleaned) == 12 and cleaned.startswith("91"):
        cleaned = cleaned[2:]
    order_phones = {order.customer_phone}
    if len(order.customer_phone) == 10:
        order_phones.add(f"91{order.customer_phone}")
    if cleaned not in order_phones and order.customer_phone not in {cleaned, f"91{cleaned}"}:
        raise HTTPException(status_code=403, detail="Phone number does not match this order")

    if order.payment_method != "upi":
        raise HTTPException(status_code=400, detail="This order is not a UPI payment order")

    content = await validate_image(file)
    url = await upload_to_supabase(
        content, "payments", file.filename or "screenshot.jpg", file.content_type or "image/jpeg"
    )
    order.payment_screenshot_url = url
    await db.commit()
    return {"url": url}
