# app/models/part.py
from sqlalchemy import Column, Integer, String, ForeignKey,Float, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Part(Base):
    __tablename__ = "parts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    sku = Column(String(64), unique=True, index=True)
    category = Column(String(100), nullable=True)      # ✅ thêm
    price = Column(Float, nullable=True)               # ✅ thêm
    description = Column(Text, nullable=True)          # ✅ thêm

    # FK liên kết đến suppliers.id
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)
    supplier = relationship("Supplier", back_populates="parts")
    inventory_items = relationship("Inventory", back_populates="part")
    assignments = relationship("Assignment", back_populates="part")


