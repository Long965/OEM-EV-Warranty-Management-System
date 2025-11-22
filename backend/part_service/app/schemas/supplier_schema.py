# app/schemas/supplier_schema.py
from pydantic import BaseModel
from typing import Optional

class SupplierBase(BaseModel):
    name: str
    contact_info: Optional[str] = None
    address: Optional[str] = None
    email: Optional[str] = None

class SupplierCreate(SupplierBase):
    pass

class SupplierOut(SupplierBase):
    id: int
    class Config:
        orm_mode = True
