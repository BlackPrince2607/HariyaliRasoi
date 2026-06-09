from sqlalchemy import Column, String, Integer, Text, Date, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.database import Base


class NgoRequest(Base):
    __tablename__ = "ngo_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    organization = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    required_date = Column(Date, nullable=False)
    quantity_needed = Column(Integer)
    notes = Column(Text)
    status = Column(String, default="new")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
