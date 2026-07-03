from sqlalchemy import Column, String, Boolean, Numeric, Time, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.database import Base


class StoreSettings(Base):
    __tablename__ = "store_settings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    is_open = Column(Boolean, default=True)
    store_name = Column(String, default="Hariyali Rasoi")
    phone = Column(String)
    whatsapp = Column(String)
    email = Column(String)
    address = Column(String)
    google_maps_url = Column(String)
    opening_time = Column(Time, default="09:00")
    closing_time = Column(Time, default="21:00")
    lunch_start = Column(Time, default="12:00")
    lunch_end = Column(Time, default="15:00")
    dinner_start = Column(Time, default="18:00")
    dinner_end = Column(Time, default="22:00")
    delivery_fee = Column(Numeric(10, 2), default=30)
    free_delivery_threshold = Column(Numeric(10, 2), default=300)
    min_order_amount = Column(Numeric(10, 2), default=100)
    upi_id = Column(String)
    upi_qr_url = Column(String)
    closed_message = Column(String, default="We are currently not accepting orders.")
    whatsapp_greeting = Column(
        String, default="Hi! I'd like to place an order from Hariyali Rasoi. 🌿"
    )
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
