from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


class ClaimStatus(str, Enum):
    draft = "Draft"
    submitted = "Submitted"
    approved = "Approved"
    rejected = "Rejected"
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
    estimated_cost: Optional[float] = 0.0 


class WarrantyClaimResponse(BaseModel):
    id: int
    vehicle_vin: str
    status: ClaimStatus
    estimated_cost: Optional[float]
    approved_cost: Optional[float]
    created_by: Optional[str]

    class Config:
        orm_mode = True
