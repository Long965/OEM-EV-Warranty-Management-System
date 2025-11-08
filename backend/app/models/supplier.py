# app/models/supplier.py
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.core.database import Base

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    contact_info = Column(String(255), nullable=True)  # thông tin liên hệ tổng quát
    email = Column(String(255), nullable=True)          # ✅ thêm email
    address = Column(String(255), nullable=True)        # ✅ thêm địa chỉ

    # Quan hệ 1-n: Supplier -> Part
    parts = relationship("Part", back_populates="supplier")
