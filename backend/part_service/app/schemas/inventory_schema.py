from pydantic import BaseModel
from typing import Optional

class InventoryBase(BaseModel):
    part_id: int
    warehouse: str
    quantity: int
    min_threshold: int = 10

class InventoryCreate(InventoryBase):
    pass

class InventoryOut(InventoryBase):
    id: int

    class Config:
        orm_mode = True

class InventoryUpdate(BaseModel):
    warehouse: Optional[str] = None
    quantity: Optional[int] = None
    min_threshold: Optional[int] = None
    class Config:
        orm_mode = True
# --- IGNORE ---

