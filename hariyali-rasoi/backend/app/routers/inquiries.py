from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_admin
from app.models.bhandara_request import BhandaraRequest
from app.models.catering_request import CateringRequest
from app.models.ngo_request import NgoRequest
from app.schemas.auth import AdminUser
from app.schemas.inquiries import (
    BhandaraRequestCreate,
    BhandaraRequestOut,
    CateringRequestCreate,
    CateringRequestOut,
    InquiryStatusUpdate,
    NgoRequestCreate,
    NgoRequestOut,
)
from app.utils.inquiry_rate_limit import check_inquiry_rate_limit

router = APIRouter()

INQUIRY_STATUSES = ("new", "contacted", "confirmed", "closed")


async def _enforce_inquiry_rate_limit(db: AsyncSession, phone: str) -> None:
    if not await check_inquiry_rate_limit(db, phone):
        raise HTTPException(
            status_code=429,
            detail="Too many inquiries from this phone number. Please try again later.",
        )


@router.post("/bhandara", response_model=BhandaraRequestOut, status_code=201)
async def create_bhandara_request(data: BhandaraRequestCreate, db: AsyncSession = Depends(get_db)):
    await _enforce_inquiry_rate_limit(db, data.phone)
    request = BhandaraRequest(**data.model_dump())
    db.add(request)
    await db.commit()
    await db.refresh(request)
    return request


@router.post("/ngo", response_model=NgoRequestOut, status_code=201)
async def create_ngo_request(data: NgoRequestCreate, db: AsyncSession = Depends(get_db)):
    await _enforce_inquiry_rate_limit(db, data.phone)
    request = NgoRequest(**data.model_dump())
    db.add(request)
    await db.commit()
    await db.refresh(request)
    return request


@router.post("/catering", response_model=CateringRequestOut, status_code=201)
async def create_catering_request(data: CateringRequestCreate, db: AsyncSession = Depends(get_db)):
    await _enforce_inquiry_rate_limit(db, data.phone)
    request = CateringRequest(**data.model_dump())
    db.add(request)
    await db.commit()
    await db.refresh(request)
    return request


@router.get("/bhandara", response_model=list[BhandaraRequestOut])
async def list_bhandara_requests(
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    result = await db.execute(
        select(BhandaraRequest).order_by(BhandaraRequest.created_at.desc())
    )
    return result.scalars().all()


@router.get("/ngo", response_model=list[NgoRequestOut])
async def list_ngo_requests(
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    result = await db.execute(select(NgoRequest).order_by(NgoRequest.created_at.desc()))
    return result.scalars().all()


@router.get("/catering", response_model=list[CateringRequestOut])
async def list_catering_requests(
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    result = await db.execute(
        select(CateringRequest).order_by(CateringRequest.created_at.desc())
    )
    return result.scalars().all()


@router.patch("/bhandara/{request_id}", response_model=BhandaraRequestOut)
async def update_bhandara_request(
    request_id: UUID,
    data: InquiryStatusUpdate,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    result = await db.execute(select(BhandaraRequest).where(BhandaraRequest.id == request_id))
    request = result.scalar_one_or_none()
    if not request:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    request.status = data.status
    if data.notes is not None:
        request.notes = data.notes
    await db.commit()
    await db.refresh(request)
    return request


@router.patch("/ngo/{request_id}", response_model=NgoRequestOut)
async def update_ngo_request(
    request_id: UUID,
    data: InquiryStatusUpdate,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    result = await db.execute(select(NgoRequest).where(NgoRequest.id == request_id))
    request = result.scalar_one_or_none()
    if not request:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    request.status = data.status
    await db.commit()
    await db.refresh(request)
    return request


@router.patch("/catering/{request_id}", response_model=CateringRequestOut)
async def update_catering_request(
    request_id: UUID,
    data: InquiryStatusUpdate,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    result = await db.execute(select(CateringRequest).where(CateringRequest.id == request_id))
    request = result.scalar_one_or_none()
    if not request:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    request.status = data.status
    await db.commit()
    await db.refresh(request)
    return request
