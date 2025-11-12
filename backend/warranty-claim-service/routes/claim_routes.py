from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from models.schema import WarrantyClaimCreate
from models.claim_model import ClaimStatus
from services import claim_service
from database import get_db

router = APIRouter(prefix="/claims", tags=["Warranty Claims"])

@router.post("/")
def create_claim(data: WarrantyClaimCreate, db: Session = Depends(get_db)):
    user_id = "01"
    claim = claim_service.create_claim(db, data, user_id)
    return {"message": "Created", "claim_id": claim.id}

@router.put("/{claim_id}/approve")
def approve_claim(claim_id: int, db: Session = Depends(get_db)):
    approver_id = "11"
    claim = claim_service.update_status(db, claim_id, ClaimStatus.approved, approver_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found or deleted")
    return {"message": "Claim approved"}

@router.put("/{claim_id}/reject")
def reject_claim(claim_id: int, db: Session = Depends(get_db)):
    approver_id = "11"
    claim = claim_service.update_status(db, claim_id, ClaimStatus.rejected, approver_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return {"message": "Claim rejected"}

@router.get("/")
def list_claims(role: str = Query("user"), user_id: str = Query("01"), db: Session = Depends(get_db)):
    claims = claim_service.list_claims(db, user_id, role)
    return claims

@router.get("/history")
def get_history(role: str = Query("user"), user_id: str = Query("01"), db: Session = Depends(get_db)):
    history = claim_service.list_history(db, user_id, role)
    return history
