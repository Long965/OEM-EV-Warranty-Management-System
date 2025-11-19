from pydantic import BaseModel
from typing import Optional, List
from enum import Enum

class ClaimStatus(str, Enum):
    pending = "Chờ duyệt"
    approved = "Đã duyệt"
    rejected = "Từ chối"

class Attachment(BaseModel):
    name: str
    url: str
    type: str

class WarrantyClaimCreate(BaseModel):
    upload_id: int                    
    vehicle_vin: str
    customer_name: Optional[str] = None
    part_serial: Optional[str] = None
    issue_desc: str
    diagnosis_report: Optional[str] = None
    attachments: Optional[List[Attachment]] = []
    warranty_cost: Optional[float] = None

class WarrantyClaimResponse(BaseModel):
    id: int
    upload_id: int  
    vehicle_vin: str
    customer_name: Optional[str]
    status: ClaimStatus
    warranty_cost: Optional[float]
    created_by: Optional[str]

    class Config:
        orm_mode = True
