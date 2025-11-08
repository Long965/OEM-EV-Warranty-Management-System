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

class WarrantyUploadResponse(WarrantyUploadCreate):
    id: uuid.UUID
    status: UploadStatus

    class Config:
        from_attributes = True
