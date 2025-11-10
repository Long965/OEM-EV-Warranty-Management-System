from pydantic import BaseModel
from typing import Optional
import uuid
from enum import Enum

class UploadStatus(str, Enum):
    draft = "Draft"
    submitted = "Submitted"
    approved = "Approved"
    rejected = "Rejected"

class WarrantyUploadCreate(BaseModel):
    vin: str
    customer_name: Optional[str]
    description: Optional[str]
    diagnosis: Optional[str]
    file_url: Optional[str]

class WarrantyUploadReject(BaseModel):
    reason: str

class WarrantyUploadResponse(WarrantyUploadCreate):
    id: uuid.UUID
    status: UploadStatus
    created_by: uuid.UUID
    approved_by: Optional[uuid.UUID]
    reject_reason: Optional[str]

    class Config:
        from_attributes = True
