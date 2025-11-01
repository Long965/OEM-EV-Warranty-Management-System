from sqlalchemy.orm import Session
from models.claim_model import WarrantyClaim, ClaimStatus
from models.schema import WarrantyClaimCreate
import uuid

def create_claim(db: Session, data: WarrantyClaimCreate, user_id: uuid.UUID):
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
    return claim

def update_status(db: Session, claim_id: uuid.UUID, status: ClaimStatus, approver_id=None):
    claim = db.query(WarrantyClaim).filter(WarrantyClaim.id == claim_id).first()
    if not claim:
        return None
    claim.status = status
    if approver_id:
        claim.approved_by = approver_id
    db.commit()
    db.refresh(claim)
    return claim
