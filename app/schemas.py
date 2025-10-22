# app/schemas.py
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

class ClaimStatus(str, Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    COMPLETED = "COMPLETED"

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str

class UserOut(BaseModel):
    user_id: int
    name: str
    email: EmailStr
    role: str
    class Config:
        orm_mode = True

class ClaimAttachmentOut(BaseModel):
    attachment_id: int
    file_path: str
    file_type: Optional[str]
    uploaded_at: datetime
    class Config:
        orm_mode = True

class ClaimCostIn(BaseModel):
    labor_cost: float = 0.0
    part_cost: float = 0.0

class ClaimCostOut(BaseModel):
    cost_id: int
    labor_cost: float
    part_cost: float
    total_cost: float
    approved_by: Optional[int]
    class Config:
        orm_mode = True

class WarrantyClaimCreate(BaseModel):
    claim_id: str
    vin: str
    customer_name: Optional[str]
    description: Optional[str]

class WarrantyClaimOut(BaseModel):
    claim_id: str
    vin: str
    customer_name: Optional[str]
    description: Optional[str]
    diagnosis: Optional[str]
    status: ClaimStatus
    created_at: datetime
    updated_at: datetime
    created_by: int
    assigned_technician_id: Optional[int]
    attachments: List[ClaimAttachmentOut] = []
    cost: Optional[ClaimCostOut] = None
    class Config:
        orm_mode = True
