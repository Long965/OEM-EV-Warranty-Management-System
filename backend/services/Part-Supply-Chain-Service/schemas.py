# schemas.py
from pydantic import BaseModel, validator
from typing import List, Optional
from datetime import datetime
from enum import Enum

# PART SCHEMAS
class SparePartCreate(BaseModel):
    part_code: str
    name: str
    type: str
    price: float
    supplier: Optional[str] = None

class SerialAssign(BaseModel):
    serial_number: str
    vehicle_vin: str

# VIN LINK SCHEMAS
class VinLink(BaseModel):
    part_id: int
    vehicle_vin: str
    serial_number: str

# INVENTORY SCHEMAS
class InventoryTransaction(BaseModel):
    part_id: int
    warehouse_id: int
    quantity: int
    type: str  # receive/issue

# DISTRIBUTION SCHEMAS
class DistributionCreate(BaseModel):
    part_id: int
    to_warehouse: int
    quantity: int

# ALERT SCHEMAS
class AlertResponse(BaseModel):
    id: int
    part_id: int
    current_stock: int
    min_stock: int
    alert_type: str

# COMBINED RESPONSES
class PartWithInventory(BaseModel):
    part: SparePartCreate
    inventory: List[dict]
    vehicle_parts: List[dict]
    distributions: List[dict]
    alerts: List[AlertResponse]
    
    class Config:
        orm_mode = True