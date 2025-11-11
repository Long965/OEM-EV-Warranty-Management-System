from sqlalchemy.orm import Session
from models.claim_model import WarrantyClaim, ClaimStatus, ClaimHistory
from models.schema import WarrantyClaimCreate
import traceback

# ---------------- LƯU LỊCH SỬ ----------------
def log_history(db: Session, claim: WarrantyClaim, action: str, user_id: str, role: str):
    """Ghi log lịch sử thao tác (vẫn lưu được kể cả khi claim bị xóa sau đó)"""
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

# ---------------- TẠO PHIẾU ----------------
def create_claim(db: Session, data: WarrantyClaimCreate, user_id: str):
    claim = WarrantyClaim(
        vehicle_vin=data.vehicle_vin,
        part_serial=getattr(data, "part_serial", None),
        issue_desc=data.issue_desc,
        diagnosis_report=getattr(data, "diagnosis_report", None),
        attachments=[a.dict() for a in getattr(data, "attachments", []) or []],
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
        print("[ERROR] create_claim failed:")
        traceback.print_exc()
        raise

# ---------------- CẬP NHẬT TRẠNG THÁI ----------------
def update_status(db: Session, claim_id: int, status: ClaimStatus, approver_id: str = None):
    claim = db.query(WarrantyClaim).filter(WarrantyClaim.id == claim_id).first()
    if not claim:
        return None

    try:
        # 🧩 Nếu admin từ chối phiếu
        if status == ClaimStatus.rejected:
            log_history(db, claim, "Từ chối phiếu", approver_id or "unknown", "admin")

            # Xóa phiếu khỏi bảng chính (history vẫn giữ vì ondelete=SET NULL)
            db.delete(claim)
            db.commit()
            return None

        # 🧩 Nếu cập nhật sang trạng thái khác (approved, submitted, ...)
        claim.status = status
        if approver_id:
            claim.approved_by = approver_id

        db.commit()
        db.refresh(claim)

        action_text = "Duyệt phiếu" if status == ClaimStatus.approved else "Cập nhật trạng thái"
        log_history(db, claim, action_text, approver_id or claim.created_by, "admin" if approver_id else "user")
        return claim

    except Exception:
        db.rollback()
        print("[ERROR] update_status failed:")
        traceback.print_exc()
        raise

# ---------------- DANH SÁCH PHIẾU ----------------
def list_claims(db: Session, user_id: str = None, role: str = "user"):
    query = db.query(WarrantyClaim)
    if role == "user":
        query = query.filter(WarrantyClaim.created_by == user_id)
    return query.order_by(WarrantyClaim.created_at.desc()).all()

# ---------------- DANH SÁCH LỊCH SỬ ----------------
def list_history(db: Session, user_id: str = None, role: str = "user"):
    query = db.query(ClaimHistory)
    if role == "user":
        query = query.filter(ClaimHistory.performed_by == user_id)
    return query.order_by(ClaimHistory.timestamp.desc()).all()
