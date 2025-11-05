# app/schemas/inventory_schema.py
from pydantic import BaseModel
from typing import Optional

class InventoryBase(BaseModel):
    part_id: int
    warehouse: Optional[str] = None
    quantity: int
    min_threshold: Optional[int] = 10

class InventoryCreate(InventoryBase):
    pass

class InventoryUpdate(BaseModel):
    quantity: Optional[int]
    min_threshold: Optional[int]

class InventoryOut(InventoryBase):
    id: int
    class Config:
        orm_mode = True
