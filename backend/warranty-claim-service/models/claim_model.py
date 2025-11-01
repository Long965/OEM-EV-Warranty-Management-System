from __future__ import annotations
from sqlalchemy import Column, String, Enum, Text, JSON, Numeric, TIMESTAMP
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.sql import func
import enum, uuid
from database import Base

class ClaimStatus(str, enum.Enum):
    draft = "Draft"
    submitted = "Submitted"
    approved = "Approved"
    completed = "Completed"

class WarrantyClaim(Base):
    __tablename__ = "warranty_claim"

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    vehicle_vin = Column(String(50), nullable=False)
    part_serial = Column(String(50))
    issue_desc = Column(Text)
    diagnosis_report = Column(Text)
    attachments = Column(JSON)
    status = Column(Enum(ClaimStatus), default=ClaimStatus.draft)
    created_by = Column(CHAR(36), nullable=True)
    approved_by = Column(CHAR(36), nullable=True)
    warranty_cost = Column(Numeric(12, 2))
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, onupdate=func.now())
