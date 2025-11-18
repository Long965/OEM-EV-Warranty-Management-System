from sqlalchemy.orm import Session
from models.upload_model import WarrantyUpload, UploadStatus
from models.schema import WarrantyUploadCreate
import requests, os, traceback

CLAIM_SERVICE_URL = os.getenv("CLAIM_SERVICE_URL", "http://warranty-claim-service:8082/claims")

def create_upload(db: Session, data: WarrantyUploadCreate, user_id: str):
    """Create new upload with submitted status"""
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

def update_upload(db: Session, upload_id: int, data: WarrantyUploadCreate):
    """Update upload - only allowed if status is 'Đã gửi' (submitted)"""
    upload = db.query(WarrantyUpload).filter(WarrantyUpload.id == upload_id).first()
    if not upload:
        return None
    
    # Only allow edit if status is "Đã gửi" (not yet processed by admin)
    if upload.status != UploadStatus.submitted:
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
        return upload
    except Exception:
        db.rollback()
        traceback.print_exc()
        raise

def delete_upload(db: Session, upload_id: int):
    """Delete upload - only allowed if status is 'Đã gửi' (submitted)"""
    upload = db.query(WarrantyUpload).filter(WarrantyUpload.id == upload_id).first()
    if not upload:
        return False
    
    # Only allow delete if status is "Đã gửi" (not yet processed by admin)
    if upload.status != UploadStatus.submitted:
        return False
    
    try:
        db.delete(upload)
        db.commit()
        return True
    except Exception:
        db.rollback()
        traceback.print_exc()
        return False

def submit_upload(db: Session, upload_id: int):
    """Submit upload to claim service for approval"""
    upload = db.query(WarrantyUpload).filter(WarrantyUpload.id == upload_id).first()
    if not upload:
        return None

    # Check if already sent to claim service
    if upload.is_sent_to_claim:
        print(f"[INFO] Upload {upload_id} already sent to Claim Service")
        return upload

    # Ensure status is submitted
    upload.status = UploadStatus.submitted
    
    # Sync to claim service
    try:
        payload = {
            "vehicle_vin": upload.vin,
            "part_serial": "AUTO",
            "issue_desc": upload.description or "",
            "diagnosis_report": upload.diagnosis or "",
            "attachments": [{"name": "report", "url": upload.file_url or "", "type": "link"}],
            "warranty_cost": float(upload.warranty_cost or 0)
        }
        resp = requests.post(CLAIM_SERVICE_URL, json=payload, timeout=5)
        if resp.status_code == 200:
            # Mark as sent to claim service
            upload.is_sent_to_claim = True
            db.commit()
            db.refresh(upload)
            print(f"[SYNC] Upload {upload_id} sent to Claim Service successfully")
        else:
            print(f"[WARN] Claim Service returned error: {resp.status_code}")
            return None
    except Exception as e:
        print(f"[WARN] Không thể sync sang Claim Service: {e}")
        return None

    return upload

def sync_status_from_claim(db: Session, upload_id: int, status: str):
    """Sync status from claim service (when approved/rejected)"""
    upload = db.query(WarrantyUpload).filter(WarrantyUpload.id == upload_id).first()
    if not upload:
        return None
    
    try:
        # Map status from claim service
        if status == "Đã duyệt":
            upload.status = UploadStatus.approved
        elif status == "Từ chối":
            upload.status = UploadStatus.rejected
        
        db.commit()
        db.refresh(upload)
        print(f"[SYNC] Upload {upload_id} status updated to: {upload.status.value}")
        return upload
    except Exception:
        db.rollback()
        traceback.print_exc()
        return None

def list_uploads(db: Session, created_by: str = None):
    """List uploads with optional filter by creator"""
    query = db.query(WarrantyUpload)
    if created_by:
        query = query.filter(WarrantyUpload.created_by == created_by)
    return query.order_by(WarrantyUpload.created_at.desc()).all()

def list_uploads_by_role(db: Session, user_id: str, role: str):
    """List uploads based on user role:
       - Admin: see ALL
       - User roles: see ONLY their own uploads
    """
    query = db.query(WarrantyUpload)

    # User → only see uploads they created
    if role != "Admin":
        query = query.filter(WarrantyUpload.created_by == user_id)

    return query.order_by(WarrantyUpload.created_at.desc()).all()
