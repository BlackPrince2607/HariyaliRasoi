from sqlalchemy import Column, String, Boolean, Numeric, Integer, ForeignKey, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base


class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    description = Column(Text)
    tags = Column(ARRAY(String), server_default="{}", default=[])
    price = Column(Numeric(10, 2), nullable=False)
    original_price = Column(Numeric(10, 2))
    is_veg = Column(Boolean, default=True)
    is_available = Column(Boolean, default=True)
    is_out_of_stock = Column(Boolean, default=False)
    is_bestseller = Column(Boolean, default=False)
    is_new = Column(Boolean, default=False)
    is_todays_special = Column(Boolean, default=False)
    preparation_time = Column(Integer, default=30)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    category = relationship("Category", back_populates="items")
    images = relationship(
        "MenuImage",
        back_populates="menu_item",
        cascade="all, delete-orphan",
        order_by="MenuImage.display_order",
    )
