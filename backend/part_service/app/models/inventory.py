from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    part_id = Column(Integer, ForeignKey("parts.id"), nullable=False)
    warehouse = Column(String(100), nullable=False)
    quantity = Column(Integer, default=0)
    min_threshold = Column(Integer, default=10)

    part = relationship("Part", back_populates="inventory")
