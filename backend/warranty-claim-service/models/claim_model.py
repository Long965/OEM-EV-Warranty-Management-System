from sqlalchemy import Column, String, Enum, Text, JSON, Numeric, TIMESTAMP, Integer, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from database import Base


class ClaimStatus(str, enum.Enum):
    draft = "Draft"
    submitted = "Submitted"
    approved = "Đã duyệt"
    rejected = "Từ chối"
    completed = "Completed"


class WarrantyClaim(Base):
    __tablename__ = "warranty_claim"

    id = Column(Integer, primary_key=True, autoincrement=True)
    vehicle_vin = Column(String(50), nullable=False)
    part_serial = Column(String(50))
    issue_desc = Column(Text)
    diagnosis_report = Column(Text)
    attachments = Column(JSON)
    status = Column(Enum(ClaimStatus), default=ClaimStatus.draft)
    created_by = Column(String(36), nullable=True)
    approved_by = Column(String(36), nullable=True)
    warranty_cost = Column(Numeric(12, 2))
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, onupdate=func.now())

class ClaimHistory(Base):
    __tablename__ = "warranty_claim_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    claim_id = Column(Integer, ForeignKey("warranty_claim.id"), nullable=True)
    vehicle_vin = Column(String(50))
    issue_desc = Column(Text)
    action = Column(String(50))
    performed_by = Column(String(36))
    performed_role = Column(String(20))
    timestamp = Column(TIMESTAMP, server_default=func.now())
