# app/schemas/part_schema.py
from pydantic import BaseModel
from typing import Optional

class PartBase(BaseModel):
    name: str
    sku: Optional[str] = None     # ✅ đổi từ part_number → sku
    category: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None
    supplier_id: Optional[int] = None

class PartCreate(PartBase):
    pass

class PartUpdate(BaseModel):
    name: Optional[str]
    sku: Optional[str]           # ✅ đổi lại cho khớp với DB
    category: Optional[str]
    price: Optional[float]
    description: Optional[str]
    supplier_id: Optional[int]

class PartOut(PartBase):
    id: int
    class Config:
        orm_mode = True
