from sqlalchemy import Column, String, Integer, Text, Date, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.database import Base


class BhandaraRequest(Base):
    __tablename__ = "bhandara_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    event_date = Column(Date, nullable=False)
    guest_count = Column(Integer, nullable=False)
    food_requirements = Column(Text)
    budget = Column(String)
    status = Column(String, default="new")
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
