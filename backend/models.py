from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
import enum
import datetime
import uuid
from database import Base

class ItemType(str, enum.Enum):
    BOX = "BOX"
    STRIP = "STRIP"

class ItemStatus(str, enum.Enum):
    CREATED = "CREATED"
    PACKED = "PACKED"
    TRANSIT = "TRANSIT"
    DELIVERED = "DELIVERED"
    CONSUMED = "CONSUMED"

# SQLAlchemy Models
class MasterMedicine(Base):
    __tablename__ = "master_medicines"

    product_id = Column(String, primary_key=True, index=True)
    brand_name = Column(String, nullable=False)
    generic_name = Column(String, nullable=False)
    composition = Column(String, nullable=False)
    primary_use = Column(String, nullable=False)
    dosage_instructions = Column(Text, nullable=False)
    storage_conditions = Column(String, nullable=False)
    warning_side_effects = Column(Text, nullable=False)
    manufacturer_name = Column(String, nullable=False)

    items = relationship("Item", back_populates="medicine")

class Item(Base):
    __tablename__ = "items"

    item_uuid = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(String, ForeignKey("master_medicines.product_id"), nullable=False)
    item_type = Column(String, nullable=False) # 'BOX' or 'STRIP'
    parent_uuid = Column(String, ForeignKey('items.item_uuid'), nullable=True)
    status = Column(String, default=ItemStatus.CREATED.value)
    current_location = Column(String, nullable=True)
    scan_count = Column(Integer, default=0)

    # Relationships
    medicine = relationship("MasterMedicine", back_populates="items")
    tracking_logs = relationship("TrackingLog", back_populates="item")

class TrackingLog(Base):
    __tablename__ = "tracking_logs"

    log_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    item_uuid = Column(String, ForeignKey('items.item_uuid'), nullable=False)
    scanned_by = Column(String, nullable=False) # e.g., 'Logistics_Hub_A'
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    location = Column(String, nullable=False)

    item = relationship("Item", back_populates="tracking_logs")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
