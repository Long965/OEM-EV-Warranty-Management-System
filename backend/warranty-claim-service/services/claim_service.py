from sqlalchemy.orm import Session
from models.claim_model import WarrantyClaim, ClaimStatus, ClaimHistory
from models.schema import WarrantyClaimCreate
import uuid


def log_history(db: Session, claim: WarrantyClaim, action: str, user_id: str, role: str):
    """Ghi log lịch sử thao tác"""
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


def create_claim(db: Session, data: WarrantyClaimCreate, user_id: str):
    claim = WarrantyClaim(
        vehicle_vin=data.vehicle_vin,
        part_serial=data.part_serial,
        issue_desc=data.issue_desc,
        diagnosis_report=data.diagnosis_report,
        attachments=[a.dict() for a in data.attachments or []],
        created_by=user_id
    )
    db.add(claim)
    db.commit()
    db.refresh(claim)
    log_history(db, claim, "Tạo mới phiếu", user_id, "user")
    return claim


def update_status(db: Session, claim_id: int, status: ClaimStatus, approver_id: str = None):
    claim = db.query(WarrantyClaim).filter(WarrantyClaim.id == claim_id).first()
    if not claim:
        return None

    # Nếu admin từ chối thì lưu lịch sử rồi xóa claim
    if status == ClaimStatus.rejected:
        log_history(db, claim, "Từ chối phiếu", approver_id, "admin")
        db.delete(claim)
        db.commit()
        return None

    claim.status = status
    if approver_id:
        claim.approved_by = approver_id

    db.commit()
    db.refresh(claim)

    action_text = "Duyệt phiếu" if status == ClaimStatus.approved else "Cập nhật trạng thái"
    log_history(db, claim, action_text, approver_id or claim.created_by, "admin" if approver_id else "user")
    return claim


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
