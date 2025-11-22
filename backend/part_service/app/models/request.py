# app/models/request.py
from sqlalchemy import Column, Integer, ForeignKey, DateTime, Enum, func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class RequestStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    fulfilled = "fulfilled"

class RequestModel(Base):
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True, index=True)
    center_id = Column(Integer, ForeignKey("service_centers.id"), nullable=False)
    part_id = Column(Integer, ForeignKey("parts.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    status = Column(Enum(RequestStatus), default=RequestStatus.pending)
    created_at = Column(DateTime, server_default=func.now())

    service_center = relationship("ServiceCenter", back_populates="requests")
    part = relationship("Part")
