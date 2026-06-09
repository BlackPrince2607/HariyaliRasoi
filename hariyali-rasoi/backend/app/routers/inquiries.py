from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_admin
from app.models.bhandara_request import BhandaraRequest
from app.models.ngo_request import NgoRequest
from app.models.catering_request import CateringRequest
from app.schemas.inquiries import (
    BhandaraRequestCreate,
    BhandaraRequestOut,
    NgoRequestCreate,
    NgoRequestOut,
    CateringRequestCreate,
    CateringRequestOut,
)
from app.schemas.auth import AdminUser

router = APIRouter()


@router.post("/bhandara", response_model=BhandaraRequestOut, status_code=201)
async def create_bhandara_request(data: BhandaraRequestCreate, db: AsyncSession = Depends(get_db)):
    request = BhandaraRequest(**data.model_dump())
    db.add(request)
    await db.commit()
    await db.refresh(request)
    return request


@router.post("/ngo", response_model=NgoRequestOut, status_code=201)
async def create_ngo_request(data: NgoRequestCreate, db: AsyncSession = Depends(get_db)):
    request = NgoRequest(**data.model_dump())
    db.add(request)
    await db.commit()
    await db.refresh(request)
    return request


@router.post("/catering", response_model=CateringRequestOut, status_code=201)
async def create_catering_request(data: CateringRequestCreate, db: AsyncSession = Depends(get_db)):
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
