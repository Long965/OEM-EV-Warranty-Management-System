from sqlalchemy import Column, String, Enum, Text, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.dialects.mysql import CHAR
import uuid, enum
from database import Base


class UploadStatus(str, enum.Enum):
    draft = "Draft"
    submitted = "Submitted"
    approved = "Approved"
    rejected = "Rejected"


class WarrantyUpload(Base):
    __tablename__ = "warranty_uploads"

    id = Column(CHAR(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    vin = Column(String(50), nullable=False)
    customer_name = Column(String(100))
    description = Column(Text)
    diagnosis = Column(Text)
    file_url = Column(String(255))
    created_by = Column(CHAR(36), nullable=False)
    approved_by = Column(CHAR(36), nullable=True)
    status = Column(Enum(UploadStatus), default=UploadStatus.draft)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, onupdate=func.now())
