from pydantic import BaseModel, ConfigDict, field_validator
from uuid import UUID
from datetime import datetime


class ReviewCreate(BaseModel):
    customer_name: str
    rating: int
    review: str

    @field_validator("rating")
    @classmethod
    def validate_rating(cls, v: int) -> int:
        if v < 1 or v > 5:
            raise ValueError("Rating must be between 1 and 5")
        return v


class ReviewOut(ReviewCreate):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    is_approved: bool
    created_at: datetime


class ReviewApproveUpdate(BaseModel):
    is_approved: bool
