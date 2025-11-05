from sqlalchemy import Column, Integer, ForeignKey, String
from sqlalchemy.orm import relationship
from app.core.database import Base

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    part_id = Column(Integer, ForeignKey("parts.id"), nullable=False)
    quantity = Column(Integer, default=0)
    warehouse = Column(String(120), nullable=True)

    # tên phải khớp với Part.inventory_items
    part = relationship("Part", back_populates="inventory_items")
    
