from datetime import datetime, timedelta, timezone
from decimal import Decimal
from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_admin
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.menu_item import MenuItem
from app.models.coupon import Coupon
from app.schemas.auth import AdminUser

router = APIRouter()


@router.get("/overview")
async def analytics_overview(
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

    orders_today = await db.scalar(
        select(func.count()).select_from(Order).where(Order.created_at >= today_start)
    )
    revenue_today = await db.scalar(
        select(func.coalesce(func.sum(Order.total), 0)).where(
            Order.created_at >= today_start, Order.status != "rejected"
        )
    )
    pending_orders = await db.scalar(
        select(func.count()).select_from(Order).where(Order.status == "pending")
    )
    total_items = await db.scalar(select(func.count()).select_from(MenuItem))

    return {
        "orders_today": orders_today or 0,
        "revenue_today": float(revenue_today or 0),
        "pending_orders": pending_orders or 0,
        "total_items": total_items or 0,
    }


@router.get("/revenue")
async def analytics_revenue(
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    result = await db.execute(
        select(
            func.date(Order.created_at).label("date"),
            func.coalesce(func.sum(Order.total), 0).label("revenue"),
        )
        .where(Order.created_at >= thirty_days_ago, Order.status != "rejected")
        .group_by(func.date(Order.created_at))
        .order_by(func.date(Order.created_at))
    )
    return [{"date": str(row.date), "revenue": float(row.revenue)} for row in result.all()]


@router.get("/top-items")
async def analytics_top_items(
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    result = await db.execute(
        select(
            OrderItem.name,
            func.sum(OrderItem.quantity).label("total_quantity"),
            func.sum(OrderItem.subtotal).label("total_revenue"),
        )
        .group_by(OrderItem.name)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(10)
    )
    return [
        {
            "name": row.name,
            "quantity": int(row.total_quantity),
            "revenue": float(row.total_revenue),
        }
        for row in result.all()
    ]


@router.get("/coupon-usage")
async def analytics_coupon_usage(
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    result = await db.execute(select(Coupon).order_by(Coupon.used_count.desc()))
    return [
        {
            "code": c.code,
            "type": c.type,
            "value": float(c.value),
            "used_count": c.used_count,
            "max_uses": c.max_uses,
            "is_active": c.is_active,
        }
        for c in result.scalars().all()
    ]
