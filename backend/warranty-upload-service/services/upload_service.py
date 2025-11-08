from sqlalchemy.orm import Session
from models.upload_model import WarrantyUpload, UploadStatus
from models.schema import WarrantyUploadCreate
import uuid

def create_upload(db: Session, data: WarrantyUploadCreate, user_id: uuid.UUID):
    upload = WarrantyUpload(
        vin=data.vin,
        customer_name=data.customer_name,
        description=data.description,
        diagnosis=data.diagnosis,
        file_url=data.file_url,
        created_by=str(user_id)
    )
    db.add(upload)
    db.commit()
    db.refresh(upload)
    return upload

def submit_upload(db: Session, upload_id: str):
    upload = db.query(WarrantyUpload).filter(WarrantyUpload.id == upload_id).first()
    if not upload:
        return None
    upload.status = UploadStatus.submitted
    db.commit()
    db.refresh(upload)
    return upload

def approve_upload(db: Session, upload_id: str, approver_id: str):
    upload = db.query(WarrantyUpload).filter(WarrantyUpload.id == upload_id).first()
    if not upload:
        return None
    upload.status = UploadStatus.approved
    upload.approved_by = approver_id
    db.commit()
    db.refresh(upload)
    return upload
