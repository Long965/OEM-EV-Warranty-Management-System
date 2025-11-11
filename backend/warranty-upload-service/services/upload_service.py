from sqlalchemy.orm import Session
from models.upload_model import WarrantyUpload, UploadStatus
from models.schema import WarrantyUploadCreate
import uuid, requests, os

# URL nội bộ của Claim Service
CLAIM_SERVICE_URL = os.getenv("CLAIM_SERVICE_URL", "http://warranty-claim-service:8082/claims")


def create_upload(db: Session, data: WarrantyUploadCreate, user_id: uuid.UUID):
    """Tạo phiếu bảo hành (user nhập giá dự kiến)"""
    upload = WarrantyUpload(
        vin=data.vin,
        customer_name=data.customer_name,
        description=data.description,
        diagnosis=data.diagnosis,
        file_url=data.file_url,
        estimated_cost=data.estimated_cost,
        created_by=str(user_id)
    )
    db.add(upload)
    db.commit()
    db.refresh(upload)
    return upload


def submit_upload(db: Session, upload_id: str):
    """Gửi phiếu lên Claim Service"""
    upload = db.query(WarrantyUpload).filter(WarrantyUpload.id == upload_id).first()
    if not upload:
        return None

    if not upload.estimated_cost or upload.estimated_cost <= 0:
        raise ValueError("Vui lòng nhập chi phí dự kiến trước khi gửi phiếu!")

    upload.status = UploadStatus.submitted
    db.commit()
    db.refresh(upload)

    # Gửi sang Claim Service
    try:
        payload = {
            "vehicle_vin": upload.vin,
            "part_serial": "AUTO",
            "issue_desc": upload.description or "",
            "diagnosis_report": upload.diagnosis or "",
            "attachments": [
                {"name": "report", "url": upload.file_url or "", "type": "link"}
            ],
            "estimated_cost": float(upload.estimated_cost or 0)
        }
        r = requests.post(CLAIM_SERVICE_URL, json=payload, timeout=5)
        print(f"[INFO] Synced to Claim Service: {r.status_code}")
    except Exception as e:
        print(f"[WARN] Không thể sync sang WarrantyClaimService: {e}")

    return upload


def list_uploads(db: Session, created_by: str = None):
    query = db.query(WarrantyUpload)
    if created_by:
        query = query.filter(WarrantyUpload.created_by == created_by)
    return query.order_by(WarrantyUpload.created_at.desc()).all()
