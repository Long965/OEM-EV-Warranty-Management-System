from sqlalchemy import Column, String, Enum, Text, TIMESTAMP, Integer, Numeric, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.dialects.mysql import CHAR
import enum
from database import Base

class UploadStatus(str, enum.Enum):
    submitted = "Đã gửi"
    approved = "Đã duyệt"
    rejected = "Từ chối"


class WarrantyUpload(Base):
    __tablename__ = "warranty_uploads"

    id = Column(Integer, primary_key=True, autoincrement=True)
    vin = Column(String(50), nullable=False)
    customer_name = Column(String(100))
    description = Column(Text)
    diagnosis = Column(Text)
    file_url = Column(String(255))
    warranty_cost = Column(Numeric(12, 2), nullable=True)
    created_by = Column(CHAR(36), nullable=False)
    approved_by = Column(CHAR(36), nullable=True)
    status = Column(Enum(UploadStatus), default=UploadStatus.submitted)
    reject_reason = Column(Text, nullable=True)
    is_sent_to_claim = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, onupdate=func.now())


# -------------------------------------------------------------
# UPLOAD HISTORY TABLE
# -------------------------------------------------------------
class UploadHistory(Base):
    __tablename__ = "warranty_upload_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    upload_id = Column(Integer, ForeignKey("warranty_uploads.id", ondelete="SET NULL"), nullable=True)
    vin = Column(String(50))
    action = Column(String(100))
    performed_by = Column(String(36))
    performed_role = Column(String(50))
    timestamp = Column(TIMESTAMP, server_default=func.now())
