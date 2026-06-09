from sqlalchemy import Column, String, Integer, Text, Date, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.database import Base


class CateringRequest(Base):
    __tablename__ = "catering_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    event_type = Column(String, nullable=False)
    event_date = Column(Date, nullable=False)
    guest_count = Column(Integer, nullable=False)
    budget = Column(String)
    notes = Column(Text)
    status = Column(String, default="new")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
