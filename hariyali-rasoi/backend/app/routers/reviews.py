from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_admin
from app.models.review import Review
from app.schemas.review import ReviewCreate, ReviewOut, ReviewApproveUpdate
from app.schemas.auth import AdminUser

router = APIRouter()


@router.get("", response_model=list[ReviewOut])
async def list_reviews(
    approved_only: bool = True,
    db: AsyncSession = Depends(get_db),
):
    query = select(Review).order_by(Review.created_at.desc())
    if approved_only:
        query = query.where(Review.is_approved == True)  # noqa: E712
    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=ReviewOut, status_code=201)
async def create_review(data: ReviewCreate, db: AsyncSession = Depends(get_db)):
    review = Review(**data.model_dump())
    db.add(review)
    await db.commit()
    await db.refresh(review)
    return review


@router.get("/admin", response_model=list[ReviewOut])
async def list_all_reviews(
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    result = await db.execute(select(Review).order_by(Review.created_at.desc()))
    return result.scalars().all()


@router.patch("/{review_id}/approve", response_model=ReviewOut)
async def approve_review(
    review_id: UUID,
    data: ReviewApproveUpdate,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    result = await db.execute(select(Review).where(Review.id == review_id))
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    review.is_approved = data.is_approved
    await db.commit()
    await db.refresh(review)
    return review


@router.delete("/{review_id}", status_code=204)
async def delete_review(
    review_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    result = await db.execute(select(Review).where(Review.id == review_id))
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    await db.delete(review)
    await db.commit()
