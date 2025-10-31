# models.py
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from .db import Base

class SparePart(Base):
    __tablename__ = "spare_parts"
    id = Column(Integer, primary_key=True)
    part_code = Column(String(50), unique=True, nullable=False)
    name = Column(String(200), nullable=False)
    type = Column(String(50), nullable=False)  # pin/motor/bms
    price = Column(Float, nullable=False)
    supplier = Column(String(100))
    status = Column(Enum("active", "inactive"), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    vehicle_parts = relationship("VehiclePart", back_populates="part")
    inventory = relationship("Inventory", back_populates="part")
    distributions = relationship("Distribution", back_populates="part")

class VehiclePart(Base):  # **GẮN SERI VIN**
    __tablename__ = "vehicle_parts"
    id = Column(Integer, primary_key=True)
    vehicle_vin = Column(String(17), nullable=False)  # VIN trực tiếp
    part_id = Column(Integer, ForeignKey("spare_parts.id"), nullable=False)
    serial_number = Column(String(50), unique=True, nullable=False)
    install_date = Column(DateTime, default=datetime.utcnow)
    technician_id = Column(Integer)
    
    part = relationship("SparePart", back_populates="vehicle_parts")

class Inventory(Base):  # **TỒN KHO**
    __tablename__ = "inventory"
    id = Column(Integer, primary_key=True)
    part_id = Column(Integer, ForeignKey("spare_parts.id"), nullable=False)
    warehouse_id = Column(Integer, nullable=False)  # 1=Trung tâm, 2+=SC
    quantity = Column(Integer, default=0)
    reserved = Column(Integer, default=0)
    min_stock = Column(Integer, default=10)
    last_updated = Column(DateTime, default=datetime.utcnow)
    
    part = relationship("SparePart", back_populates="inventory")
    alerts = relationship("Alert", back_populates="inventory")

class Distribution(Base):  # **PHÂN BỔ**
    __tablename__ = "distributions"
    id = Column(Integer, primary_key=True)
    part_id = Column(Integer, ForeignKey("spare_parts.id"), nullable=False)
    from_warehouse = Column(Integer, default=1)
    to_warehouse = Column(Integer, nullable=False)
    quantity = Column(Integer, nullable=False)
    status = Column(Enum("pending", "shipped", "delivered"), default="pending")
    tracking_number = Column(String(50))
    request_date = Column(DateTime, default=datetime.utcnow)
    
    part = relationship("SparePart", back_populates="distributions")

class Alert(Base):  # **CẢNH BÁO**
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True)
    inventory_id = Column(Integer, ForeignKey("inventory.id"), nullable=False)
    part_id = Column(Integer, ForeignKey("spare_parts.id"))
    current_stock = Column(Integer)
    min_stock = Column(Integer)
    alert_type = Column(Enum("low_stock", "out_of_stock"))
    sent_date = Column(DateTime, default=datetime.utcnow)
    status = Column(Enum("sent", "read"), default="sent")
    
    inventory = relationship("Inventory", back_populates="alerts")