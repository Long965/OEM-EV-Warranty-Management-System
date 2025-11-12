from sqlalchemy.orm import Session
from models.upload_model import WarrantyUpload, UploadStatus
from models.schema import WarrantyUploadCreate
import requests, os

CLAIM_SERVICE_URL = os.getenv("CLAIM_SERVICE_URL", "http://warranty-claim-service:8082/claims")

# 🟢 Nhân viên tạo phiếu
def create_upload(db: Session, data: WarrantyUploadCreate, user_id: str):
    upload = WarrantyUpload(
        vin=data.vin,
        customer_name=data.customer_name,
        description=data.description,
        diagnosis=data.diagnosis,
        file_url=data.file_url,
        warranty_cost=data.warranty_cost,
        created_by=str(user_id),
        status=UploadStatus.submitted
    )
    db.add(upload)
    db.commit()
    db.refresh(upload)
    return upload

# 🟡 Gửi phiếu sang Claim Service
def submit_upload(db: Session, upload_id: int):
    upload = db.query(WarrantyUpload).filter(WarrantyUpload.id == upload_id).first()
    if not upload:
        return None

    upload.status = UploadStatus.submitted
    db.commit()
    db.refresh(upload)

    try:
        payload = {
            "vehicle_vin": upload.vin,
            "part_serial": "AUTO",
            "issue_desc": upload.description or "",
            "diagnosis_report": upload.diagnosis or "",
            "attachments": [{"name": "report", "url": upload.file_url or "", "type": "link"}],
            "warranty_cost": float(upload.warranty_cost or 0)
        }
        requests.post(CLAIM_SERVICE_URL, json=payload, timeout=5)
    except Exception as e:
        print(f"[WARN] Không thể sync sang Claim Service: {e}")

    return upload

# 📜 Danh sách phiếu
def list_uploads(db: Session, created_by: str = None):
    query = db.query(WarrantyUpload)
    if created_by:
        query = query.filter(WarrantyUpload.created_by == created_by)
    return query.order_by(WarrantyUpload.created_at.desc()).all()

