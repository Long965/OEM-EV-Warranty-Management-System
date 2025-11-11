from sqlalchemy.orm import Session
from models.claim_model import WarrantyClaim, ClaimStatus, ClaimHistory
from models.schema import WarrantyClaimCreate


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
        estimated_cost=data.estimated_cost,
        created_by=user_id
    )
    db.add(claim)
    db.commit()
    db.refresh(claim)
    log_history(db, claim, f"Tạo mới phiếu (chi phí dự kiến: {data.estimated_cost}₫)", user_id, "user")
    return claim


def update_status(db: Session, claim_id: int, status: ClaimStatus, approver_id: str = None, approved_cost: float = None):
    claim = db.query(WarrantyClaim).filter(WarrantyClaim.id == claim_id).first()
    if not claim:
        return None

    # Admin từ chối
    if status == ClaimStatus.rejected:
        log_history(db, claim, "Từ chối phiếu", approver_id, "admin")
        db.delete(claim)
        db.commit()
        return None

    # Admin duyệt
    if status == ClaimStatus.approved:
        claim.status = status
        claim.approved_by = approver_id
        if approved_cost is not None:
            claim.approved_cost = approved_cost
        db.commit()
        db.refresh(claim)
        log_history(db, claim, f"Duyệt phiếu (giá được duyệt: {approved_cost}₫)", approver_id, "admin")
        return claim

    # Các trạng thái khác (submit)
    claim.status = status
    db.commit()
    db.refresh(claim)
    log_history(db, claim, f"Cập nhật trạng thái thành {status.value}", approver_id or claim.created_by, "user")
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
