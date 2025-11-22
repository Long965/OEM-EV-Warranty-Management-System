from sqlalchemy.orm import Session
from models.upload_model import WarrantyUpload, UploadStatus, UploadHistory
from models.schema import WarrantyUploadCreate
import requests, os, traceback

CLAIM_SERVICE_URL = os.getenv("CLAIM_SERVICE_URL", "http://warranty-claim-service:8082/claims")

def log_history(db: Session, upload: WarrantyUpload, action: str, user_id: str, role: str):
    try:
        history = UploadHistory(
            upload_id=upload.id,
            vin=upload.vin,
            action=action,
            performed_by=user_id,
            performed_role=role
        )
        db.add(history)
        db.commit()
    except Exception:
        db.rollback()
        traceback.print_exc()

def create_upload(db: Session, data: WarrantyUploadCreate, user_id: str, role: str):
    upload = WarrantyUpload(
        vin=data.vin,
        customer_name=data.customer_name,
        description=data.description,
        diagnosis=data.diagnosis,
        file_url=data.file_url,
        warranty_cost=data.warranty_cost,
        created_by=user_id,
        status=UploadStatus.submitted
    )
    db.add(upload)
    db.commit()
    db.refresh(upload)
    log_history(db, upload, "Tạo mới phiếu upload", user_id, role)
    return upload

def update_upload(db: Session, upload_id: int, data: WarrantyUploadCreate, user_id: str, role: str):
    upload = db.query(WarrantyUpload).filter(WarrantyUpload.id == upload_id).first()
    if not upload or upload.status != UploadStatus.submitted:
        return None
    
    try:
        upload.vin = data.vin
        upload.customer_name = data.customer_name
        upload.description = data.description
        upload.diagnosis = data.diagnosis
        upload.file_url = data.file_url
        upload.warranty_cost = data.warranty_cost
        db.commit()
        db.refresh(upload)
        log_history(db, upload, "Chỉnh sửa phiếu upload", user_id, role)
        return upload
    except Exception:
        db.rollback()
        traceback.print_exc()
        raise

def delete_upload(db: Session, upload_id: int, user_id: str, role: str):
    upload = db.query(WarrantyUpload).filter(WarrantyUpload.id == upload_id).first()
    if not upload or upload.status != UploadStatus.submitted:
        return False
    
    try:
        log_history(db, upload, "Xóa phiếu upload", user_id, role)
        db.delete(upload)
        db.commit()
        return True
    except:
        db.rollback()
        traceback.print_exc()
        return False

def submit_upload(db: Session, upload_id: int, user_id: str, role: str):
    upload = db.query(WarrantyUpload).filter(WarrantyUpload.id == upload_id).first()
    if not upload:
        return None
    
    if upload.is_sent_to_claim:
        return upload
    
    upload.status = UploadStatus.submitted
    
    payload = {
        "upload_id": upload.id,
        "vehicle_vin": upload.vin,
        "customer_name": upload.customer_name,
        "part_serial": "AUTO",
        "issue_desc": upload.description or "",
        "diagnosis_report": upload.diagnosis or "",
        "attachments": [{"name": "report", "url": upload.file_url, "type": "link"}],
        "warranty_cost": float(upload.warranty_cost or 0)
    }
    
    try:
        resp = requests.post(
            CLAIM_SERVICE_URL,
            json=payload,
            headers={"x-user-id": user_id, "x-user-role": role},
            timeout=5
        )
        if resp.status_code == 200:
            upload.is_sent_to_claim = True
            db.commit()
            db.refresh(upload)
            log_history(db, upload, "Gửi phiếu lên Claim Service", user_id, role)
            return upload
        return None
    except Exception:
        return None

def sync_status_from_claim(db: Session, upload_id: int, status: str):
    upload = db.query(WarrantyUpload).filter(WarrantyUpload.id == upload_id).first()
    if not upload:
        return None
    
    try:
        if status == "Đã duyệt":
            upload.status = UploadStatus.approved
        elif status == "Từ chối":
            upload.status = UploadStatus.rejected
        db.commit()
        db.refresh(upload)
        return upload
    except:
        db.rollback()
        traceback.print_exc()
        return None

def list_uploads_by_role(db: Session, user_id: str, role: str):
    q = db.query(WarrantyUpload)
    if role != "Admin":
        q = q.filter(WarrantyUpload.created_by == user_id)
    return q.order_by(WarrantyUpload.created_at.desc()).all()

def list_user_history(db: Session, user_id: str):

    return (
        db.query(UploadHistory)
        .filter(UploadHistory.performed_by == user_id) 
        .order_by(UploadHistory.timestamp.desc())
        .all()
    )
def list_admin_history(db: Session):

    return (
        db.query(UploadHistory)
        .order_by(UploadHistory.timestamp.desc())
        .all()
    )