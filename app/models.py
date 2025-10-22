# app/models.py
from sqlalchemy import Column, Integer, String, DateTime, Text, Enum, ForeignKey, DECIMAL
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from .database import Base

class ClaimStatusEnum(str, enum.Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    COMPLETED = "COMPLETED"

class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)  # ADMIN, TECHNICIAN, SC_STAFF, EVM_STAFF

    created_claims = relationship("WarrantyClaim", back_populates="creator", foreign_keys="WarrantyClaim.created_by")
    assigned_claims = relationship("WarrantyClaim", back_populates="assigned_technician", foreign_keys="WarrantyClaim.assigned_technician_id")
    approved_costs = relationship("ClaimCost", back_populates="approver", foreign_keys="ClaimCost.approved_by")

class WarrantyClaim(Base):
    __tablename__ = "warranty_claims"
    claim_id = Column(String(50), primary_key=True, index=True)
    vin = Column(String(50), nullable=False)
    customer_name = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    diagnosis = Column(Text, nullable=True)

    status = Column(Enum(ClaimStatusEnum), nullable=False, default=ClaimStatusEnum.DRAFT)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    created_by = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    assigned_technician_id = Column(Integer, ForeignKey("users.user_id"), nullable=True)

    creator = relationship("User", foreign_keys=[created_by], back_populates="created_claims")
    assigned_technician = relationship("User", foreign_keys=[assigned_technician_id], back_populates="assigned_claims")

    attachments = relationship("ClaimAttachment", back_populates="claim", cascade="all, delete-orphan")
    cost = relationship("ClaimCost", uselist=False, back_populates="claim", cascade="all, delete-orphan")

class ClaimAttachment(Base):
    __tablename__ = "claim_attachments"
    attachment_id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(String(50), ForeignKey("warranty_claims.claim_id", ondelete="CASCADE"), nullable=False)
    file_path = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    claim = relationship("WarrantyClaim", back_populates="attachments")

class ClaimCost(Base):
    __tablename__ = "claim_costs"
    cost_id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(String(50), ForeignKey("warranty_claims.claim_id", ondelete="CASCADE"), unique=True)
    labor_cost = Column(DECIMAL(10,2), default=0.0)
    part_cost = Column(DECIMAL(10,2), default=0.0)
    total_cost = Column(DECIMAL(10,2), default=0.0)
    approved_by = Column(Integer, ForeignKey("users.user_id"), nullable=True)

    claim = relationship("WarrantyClaim", back_populates="cost")
    approver = relationship("User", back_populates="approved_costs")
