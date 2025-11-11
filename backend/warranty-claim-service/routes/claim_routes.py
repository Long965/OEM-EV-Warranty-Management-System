from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from models.schema import WarrantyClaimCreate
# Import ClaimStatus từ model để cùng 1 enum với service
from models.claim_model import ClaimStatus
from services import claim_service
from database import get_db

router = APIRouter(prefix="/claims", tags=["Warranty Claims"])


@router.post("/")
def create_claim(data: WarrantyClaimCreate, db: Session = Depends(get_db)):
    user_id = "01"
    claim = claim_service.create_claim(db, data, user_id)
    return {"message": "Created", "claim_id": claim.id}


@router.put("/{claim_id}/submit")
def submit_claim(claim_id: int, db: Session = Depends(get_db)):
    claim = claim_service.update_status(db, claim_id, ClaimStatus.submitted)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return {"message": "Claim submitted"}


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
    try:
        # update_status sẽ lưu lịch sử rồi xóa claim nếu bị reject
        result = claim_service.update_status(db, claim_id, ClaimStatus.rejected, approver_id)
        # result is None when claim was deleted (expected)
        return {"message": "Claim rejected and removed"}
    except Exception as e:
        # Trả lỗi rõ ràng để không gây Internal Server Error
        raise HTTPException(status_code=500, detail=f"Error rejecting claim: {e}")


@router.get("/")
def list_claims(role: str = Query("user"), user_id: str = Query("01"), db: Session = Depends(get_db)):
    claims = claim_service.list_claims(db, user_id, role)
    return claims


@router.get("/history")
def get_history(role: str = Query("user"), user_id: str = Query("01"), db: Session = Depends(get_db)):
    history = claim_service.list_history(db, user_id, role)
    return history
