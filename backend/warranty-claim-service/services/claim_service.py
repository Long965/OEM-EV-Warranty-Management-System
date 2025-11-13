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
    except Exception:
        db.rollback()
        print("[ERROR] log_history failed:")
        traceback.print_exc()


def create_claim(db: Session, data: WarrantyClaimCreate, user_id: str):
    claim = WarrantyClaim(
        vehicle_vin=data.vehicle_vin,
        part_serial=getattr(data, "part_serial", None),
        issue_desc=data.issue_desc,
        diagnosis_report=getattr(data, "diagnosis_report", None),
        attachments=[a.dict() for a in getattr(data, "attachments", []) or []],
        warranty_cost=getattr(data, "warranty_cost", 0),
        created_by=user_id
    )
    try:
        db.add(claim)
        db.commit()
        db.refresh(claim)
        log_history(db, claim, "Tạo mới phiếu", user_id, "user")
        return claim
    except Exception:
        db.rollback()
        traceback.print_exc()
        raise


def update_status(db: Session, claim_id: int, status: ClaimStatus, approver_id: str = None):
    claim = db.query(WarrantyClaim).filter(WarrantyClaim.id == claim_id).first()
    if not claim:
        return None

    try:
        claim.status = status
        if approver_id:
            claim.approved_by = approver_id

        db.commit()
        db.refresh(claim)

        action_text = "Duyệt phiếu" if status == ClaimStatus.approved else "Từ chối phiếu"
        log_history(db, claim, action_text, approver_id or claim.created_by, "admin")

        try:
            payload = {"status": claim.status.value}
            upload_id = claim.id
            resp = requests.put(
                f"{UPLOAD_SERVICE_URL}/{upload_id}/sync-status",
                params=payload,
                timeout=5
            )
            if resp.status_code == 200:
                print(f"[SYNC] Upload {upload_id} đã cập nhật trạng thái: {claim.status.value}")
            else:
                print(f"[WARN] Upload Service trả về lỗi: {resp.status_code} {resp.text}")
        except Exception as e:
            print(f"[WARN] Không thể đồng bộ sang Upload Service: {e}")

        return claim

    except Exception:
        db.rollback()
        traceback.print_exc()
        raise


def list_claims(db: Session, user_id: str = None, role: str = "user"):
    query = db.query(WarrantyClaim)
    if role == "user":
        query = query.filter(WarrantyClaim.created_by == user_id)
    return query.order_by(WarrantyClaim.created_at.desc()).all()


def list_history(db: Session, user_id: str = None, role: str = "user"):
    query = db.query(ClaimHistory)
    if role == "user":
        query = query.filter(ClaimHistory.performed_by == user_id)
    return query.order_by(ClaimHistory.timestamp.desc()).all()

def update_claim(db: Session, claim_id: int, data: WarrantyClaimCreate, user_id: str):
    """Update claim information"""
    claim = db.query(WarrantyClaim).filter(WarrantyClaim.id == claim_id).first()
    if not claim:
        return None

    try:
        claim.vehicle_vin = data.vehicle_vin
        claim.part_serial = getattr(data, "part_serial", None)
        claim.issue_desc = data.issue_desc
        claim.diagnosis_report = getattr(data, "diagnosis_report", None)
        claim.attachments = [a.dict() for a in getattr(data, "attachments", []) or []]
        claim.warranty_cost = getattr(data, "warranty_cost", 0)

        db.commit()
        db.refresh(claim)
        log_history(db, claim, "Chỉnh sửa phiếu", user_id, "admin")
        return claim
    except Exception:
        db.rollback()
        traceback.print_exc()
        raise