from sqlalchemy.orm import Session
from models.upload_model import WarrantyUpload, UploadStatus
from models.schema import WarrantyUploadCreate
import uuid, requests, os


CLAIM_SERVICE_URL = os.getenv("CLAIM_SERVICE_URL", "http://warranty-claim-service:8083/claims")


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

    try:
        payload = {
            "vehicle_vin": upload.vin,
            "part_serial": "AUTO",
            "issue_desc": upload.description or "",
            "diagnosis_report": upload.diagnosis or "",
            "attachments": [{"name": "report", "url": upload.file_url or "", "type": "link"}]
        }
        requests.post(CLAIM_SERVICE_URL, json=payload, timeout=5)
    except Exception as e:
        print(f"[WARN] Không thể sync sang WarrantyClaimService: {e}")

    return upload


def reject_upload(db: Session, upload_id: str, reason: str, approver_id: str):
    upload = db.query(WarrantyUpload).filter(WarrantyUpload.id == upload_id).first()
    if not upload:
        return None
    upload.status = UploadStatus.rejected
    upload.reject_reason = reason
    upload.approved_by = approver_id
    db.commit()
    db.refresh(upload)
    return upload


def list_uploads(db: Session, created_by: str = None):
    query = db.query(WarrantyUpload)
    if created_by:
        query = query.filter(WarrantyUpload.created_by == created_by)
    return query.order_by(WarrantyUpload.created_at.desc()).all()
