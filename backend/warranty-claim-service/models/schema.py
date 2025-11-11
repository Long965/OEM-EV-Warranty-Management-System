from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from enum import Enum

class ClaimStatus(str, Enum):
    draft = "Draft"
    submitted = "Submitted"
    approved = "Approved"
    completed = "Completed"

class Attachment(BaseModel):
    name: str
    url: str
    type: str

class WarrantyClaimCreate(BaseModel):
    vehicle_vin: str
    part_serial: Optional[str]
    issue_desc: str
    diagnosis_report: Optional[str]
    attachments: Optional[List[Attachment]] = []

class WarrantyClaimResponse(BaseModel):
    id: UUID
    vehicle_vin: str
    status: ClaimStatus
    warranty_cost: Optional[float]
    created_by: Optional[UUID]

    class Config:
        orm_mode = True