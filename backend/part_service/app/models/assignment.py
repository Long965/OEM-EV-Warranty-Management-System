# app/models/assignment.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    part_id = Column(Integer, ForeignKey("parts.id"), nullable=False)
    assigned_to = Column(String(100), nullable=False)
    assigned_date = Column(DateTime, default=func.now())
    note = Column(String(255))
    vin = Column(String(64), nullable=True)

    # Quan hệ với bảng parts
    part = relationship("Part", back_populates="assignments")
