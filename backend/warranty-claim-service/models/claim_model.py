from sqlalchemy import Column, String, Enum, Text, JSON, Numeric, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import enum, uuid
from database import Base

class ClaimStatus(str, enum.Enum):
    draft = "Draft"
    submitted = "Submitted"
    approved = "Approved"
    completed = "Completed"

class WarrantyClaim(Base):
    __tablename__ = "warranty_claims"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vehicle_vin = Column(String(50), nullable=False)
    part_serial = Column(String(50))
    issue_desc = Column(Text)
    diagnosis_report = Column(Text)
    attachments = Column(JSON)
    status = Column(Enum(ClaimStatus), default=ClaimStatus.draft)
    created_by = Column(UUID(as_uuid=True))
    approved_by = Column(UUID(as_uuid=True))
    warranty_cost = Column(Numeric(12,2))
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, onupdate=func.now())
