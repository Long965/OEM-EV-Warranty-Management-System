# app/models/distribution.py
from sqlalchemy import Column, Integer, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Distribution(Base):
    __tablename__ = "distributions"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("requests.id"), nullable=True)
    part_id = Column(Integer, ForeignKey("parts.id"), nullable=False)
    center_id = Column(Integer, ForeignKey("service_centers.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    distributed_at = Column(DateTime, server_default=func.now())

    part = relationship("Part")
