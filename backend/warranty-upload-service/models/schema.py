from pydantic import BaseModel
from typing import Optional
from enum import Enum

class UploadStatus(str, Enum):
    submitted = "Đã gửi"
    approved = "Đã duyệt"
    rejected = "Từ chối"

class WarrantyUploadCreate(BaseModel):
    vin: str
    customer_name: Optional[str]
    description: Optional[str]
    diagnosis: Optional[str]
    file_url: Optional[str]
    warranty_cost: Optional[float] = None

class WarrantyUploadReject(BaseModel):
    reason: str

class WarrantyUploadApprove(BaseModel):
    warranty_cost: Optional[float] = None

class WarrantyUploadResponse(WarrantyUploadCreate):
    id: int
    status: UploadStatus
    created_by: str
    approved_by: Optional[str]
    reject_reason: Optional[str]

    class Config:
        orm_mode = True
