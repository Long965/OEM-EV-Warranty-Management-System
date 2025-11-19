from sqlalchemy.orm import Session
from models.claim_model import WarrantyClaim, ClaimStatus, ClaimHistory
from models.schema import WarrantyClaimCreate
import requests, os, traceback

UPLOAD_SERVICE_URL = os.getenv("UPLOAD_SERVICE_URL", "http://warranty-upload-service:8083/uploads")

def log_history(db: Session, claim: WarrantyClaim, action: str, user_id: str, role: str):
    try:
        history = ClaimHistory(
            claim_id=claim.id,
            vehicle_vin=claim.vehicle_vin,
            issue_desc=claim.issue_desc,
            action=action,
            performed_by=user_id,
            performed_role=role
        )
        db.add(history)
        db.commit()
    except:
        db.rollback()
        traceback.print_exc()

def create_claim(db: Session, data: WarrantyClaimCreate, user_id: str, role: str):
    claim = WarrantyClaim(
        upload_id=data.upload_id,   
        vehicle_vin=data.vehicle_vin,
        customer_name=data.customer_name,
        part_serial=data.part_serial,
        issue_desc=data.issue_desc,
        diagnosis_report=data.diagnosis_report,
        attachments=[a.dict() for a in data.attachments],
        warranty_cost=data.warranty_cost or 0,
        created_by=user_id
    )

    try:
        db.add(claim)
        db.commit()
        db.refresh(claim)

        log_history(db, claim, "Tạo mới phiếu", user_id, role)
        return claim

    except:
        db.rollback()
        traceback.print_exc()
        raise

def update_status(db: Session, claim_id: int, status: ClaimStatus, admin_id: str, role: str):
    claim = db.query(WarrantyClaim).filter(WarrantyClaim.id == claim_id).first()
    if not claim:
        return None

    try:
        claim.status = status
        claim.approved_by = admin_id

        db.commit()
        db.refresh(claim)

        action = "Duyệt phiếu" if status == ClaimStatus.approved else "Từ chối phiếu"
        log_history(db, claim, action, admin_id, role)

        try:
            requests.put(
                f"{UPLOAD_SERVICE_URL}/{claim.upload_id}/sync-status",
                params={"status": claim.status.value},
                timeout=5
            )
        except:
            pass

        return claim

    except:
        db.rollback()
        traceback.print_exc()
        raise

def list_claims(db: Session, user_id: str, role: str):
    query = db.query(WarrantyClaim)

    if role != "Admin":
        query = query.filter(WarrantyClaim.created_by == user_id)

    return query.order_by(WarrantyClaim.created_at.desc()).all()

def list_user_history(db: Session, user_id: str):
    return (
        db.query(ClaimHistory)
        .filter(ClaimHistory.performed_by == user_id)
        .order_by(ClaimHistory.timestamp.desc())
        .all()
    )

def list_admin_history(db: Session):
    return (
        db.query(ClaimHistory)
        # ✅ REMOVED filter - không lọc gì cả
        .order_by(ClaimHistory.timestamp.desc())
        .all()
    )

def get_claim_by_permission(db: Session, claim_id: int, user_id: str, role: str):
    claim = db.query(WarrantyClaim).filter(WarrantyClaim.id == claim_id).first()
    if not claim:
        return None

    if role != "Admin" and claim.created_by != user_id:
        return None

    return claim

def update_claim(db: Session, claim_id: int, data: WarrantyClaimCreate, admin_id: str, role: str):
    claim = db.query(WarrantyClaim).filter(WarrantyClaim.id == claim_id).first()
    if not claim:
        return None

    try:
        claim.vehicle_vin = data.vehicle_vin
        claim.customer_name = data.customer_name
        claim.part_serial = data.part_serial
        claim.issue_desc = data.issue_desc
        claim.diagnosis_report = data.diagnosis_report
        claim.attachments = [a.dict() for a in (data.attachments or [])]
        claim.warranty_cost = data.warranty_cost or 0

        db.commit()
        db.refresh(claim)

        log_history(db, claim, "Chỉnh sửa phiếu", admin_id, role)

        return claim

    except Exception:
        db.rollback()
        traceback.print_exc()
        raise

def delete_claim(db: Session, claim_id: int, admin_id: str, role: str):
    claim = db.query(WarrantyClaim).filter(WarrantyClaim.id == claim_id).first()
    if not claim:
        return False

    try:
        log_history(db, claim, "Xóa phiếu", admin_id, role)

        db.query(ClaimHistory).filter(ClaimHistory.claim_id == claim_id).delete()
        db.delete(claim)
        db.commit()

        return True
    except Exception:
        db.rollback()
        traceback.print_exc()
        return False
