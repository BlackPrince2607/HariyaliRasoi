from decimal import Decimal
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi import HTTPException
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.menu_item import MenuItem
from app.models.store_settings import StoreSettings
from app.schemas.order import OrderCreate, OrderOut
from app.services.coupon_service import validate_coupon
from app.utils.order_number import generate_order_number
from app.utils.rate_limit import check_order_rate_limit


async def get_store_settings(db: AsyncSession) -> StoreSettings:
    result = await db.execute(select(StoreSettings).limit(1))
    settings = result.scalar_one_or_none()
    if not settings:
        raise HTTPException(status_code=500, detail="Store settings not configured")
    return settings


async def create_order(db: AsyncSession, data: OrderCreate) -> Order:
    store = await get_store_settings(db)

    if not store.is_open:
        raise HTTPException(status_code=400, detail=store.closed_message)

    if not await check_order_rate_limit(db, data.customer_phone):
        raise HTTPException(
            status_code=429,
            detail="Too many orders from this phone number. Please try again later.",
        )

    if not data.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one item")

    menu_item_ids = [item.menu_item_id for item in data.items]
    result = await db.execute(select(MenuItem).where(MenuItem.id.in_(menu_item_ids)))
    all_menu_items = {item.id: item for item in result.scalars().all()}

    order_items_data = []
    subtotal = Decimal("0")

    for item in data.items:
        menu_item = all_menu_items.get(item.menu_item_id)
        if not menu_item:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Some items in your cart are outdated. "
                    "Please clear your cart and add items from the menu again."
                ),
            )
        if not menu_item.is_available:
            raise HTTPException(
                status_code=400,
                detail=f"{menu_item.name} is no longer available. Please remove it from your cart.",
            )
        if menu_item.is_out_of_stock:
            raise HTTPException(status_code=400, detail=f"{menu_item.name} is out of stock")

        item_subtotal = (menu_item.price * item.quantity).quantize(Decimal("0.01"))
        subtotal += item_subtotal
        order_items_data.append({
            "menu_item_id": menu_item.id,
            "name": menu_item.name,
            "price": menu_item.price,
            "quantity": item.quantity,
            "subtotal": item_subtotal,
        })

    discount = Decimal("0")
    coupon = None
    if data.coupon_code:
        valid, discount, message, coupon = await validate_coupon(db, data.coupon_code, subtotal)
        if not valid:
            raise HTTPException(status_code=400, detail=message)

    if subtotal < store.min_order_amount:
        raise HTTPException(
            status_code=400,
            detail=f"Minimum order amount is ₹{store.min_order_amount}",
        )

    delivery_fee = Decimal("0")
    if subtotal < store.free_delivery_threshold:
        delivery_fee = store.delivery_fee

    total = (subtotal - discount + delivery_fee).quantize(Decimal("0.01"))

    order_number = await generate_order_number(db)

    order = Order(
        order_number=order_number,
        customer_name=data.customer_name,
        customer_phone=data.customer_phone,
        customer_email=data.customer_email,
        delivery_address=data.delivery_address,
        order_notes=data.order_notes,
        payment_method=data.payment_method,
        payment_status="pending",
        status="pending",
        subtotal=subtotal,
        discount=discount,
        delivery_fee=delivery_fee,
        total=total,
        coupon_code=data.coupon_code.upper() if data.coupon_code else None,
        coupon_id=coupon.id if coupon else None,
    )
    db.add(order)
    await db.flush()

    for item_data in order_items_data:
        db.add(OrderItem(order_id=order.id, **item_data))

    if coupon:
        coupon.used_count += 1

    await db.commit()

    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == order.id)
    )
    return result.scalar_one()


async def get_order_by_id(db: AsyncSession, order_id: UUID) -> Order | None:
    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
    )
    return result.scalar_one_or_none()


async def get_order_by_number_and_phone(
    db: AsyncSession, order_number: str, customer_phone: str
) -> Order | None:
    phone_variants = {customer_phone}
    if len(customer_phone) == 10:
        phone_variants.add(f"91{customer_phone}")
    elif len(customer_phone) == 12 and customer_phone.startswith("91"):
        phone_variants.add(customer_phone[2:])

    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(
            Order.order_number == order_number,
            Order.customer_phone.in_(phone_variants),
        )
    )
    return result.scalar_one_or_none()
