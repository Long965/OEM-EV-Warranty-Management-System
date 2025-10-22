# app/crud.py
from sqlalchemy.orm import Session
from . import models, schemas
from decimal import Decimal

def create_claim(db: Session, claim_in: schemas.WarrantyClaimCreate, creator_id: int):
    claim = models.WarrantyClaim(
        claim_id=claim_in.claim_id,
        vin=claim_in.vin,
        customer_name=claim_in.customer_name,
        description=claim_in.description,
        created_by=creator_id,
        status=models.ClaimStatusEnum.DRAFT
    )
    db.add(claim)
    db.commit()
    db.refresh(claim)
    return claim

def get_claim(db: Session, claim_id: str):
    return db.query(models.WarrantyClaim).filter(models.WarrantyClaim.claim_id == claim_id).first()

def submit_claim(db: Session, claim: models.WarrantyClaim, user_id: int):
    if claim.status != models.ClaimStatusEnum.DRAFT:
        raise ValueError("Only DRAFT can be submitted")
    claim.status = models.ClaimStatusEnum.SUBMITTED
    db.commit()
    db.refresh(claim)
    return claim

def approve_claim(db: Session, claim: models.WarrantyClaim, approver_id: int):
    if claim.status != models.ClaimStatusEnum.SUBMITTED:
        raise ValueError("Only SUBMITTED claims can be approved")
    claim.status = models.ClaimStatusEnum.APPROVED
    db.commit()
    db.refresh(claim)
    return claim

def reject_claim(db: Session, claim: models.WarrantyClaim, approver_id: int, reason: str = None):
    if claim.status not in (models.ClaimStatusEnum.SUBMITTED, models.ClaimStatusEnum.DRAFT):
        raise ValueError("Cannot reject in current status")
    claim.status = models.ClaimStatusEnum.REJECTED
    db.commit()
    db.refresh(claim)
    return claim

def complete_claim(db: Session, claim: models.WarrantyClaim):
    if claim.status != models.ClaimStatusEnum.APPROVED:
        raise ValueError("Only APPROVED claims can be completed")
    claim.status = models.ClaimStatusEnum.COMPLETED
    db.commit()
    db.refresh(claim)
    return claim

def add_attachment(db: Session, claim: models.WarrantyClaim, file_path: str, file_type: str = None):
    att = models.ClaimAttachment(claim_id=claim.claim_id, file_path=file_path, file_type=file_type)
    db.add(att)
    db.commit()
    db.refresh(att)
    return att

def set_cost(db: Session, claim: models.WarrantyClaim, labor: float, part: float, approver_id: int = None):
    total = Decimal(str(labor)) + Decimal(str(part))
    if claim.cost:
        claim.cost.labor_cost = labor
        claim.cost.part_cost = part
        claim.cost.total_cost = total
    else:
        cost = models.ClaimCost(claim_id=claim.claim_id, labor_cost=labor, part_cost=part, total_cost=total, approved_by=approver_id)
        db.add(cost)
    db.commit()
    db.refresh(claim)
    return claim.cost or claim.cost
