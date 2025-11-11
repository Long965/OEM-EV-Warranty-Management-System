from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from models.schema import WarrantyClaimCreate, ClaimStatus
from services import claim_service
from database import get_db

router = APIRouter(prefix="/claims", tags=["Warranty Claims"])


@router.post("/", summary="Nhân viên tạo phiếu bảo hành (có chi phí dự kiến)")
def create_claim(data: WarrantyClaimCreate, db: Session = Depends(get_db)):
    user_id = "01"
    claim = claim_service.create_claim(db, data, user_id)
    return {"message": "Created", "claim_id": claim.id, "estimated_cost": float(claim.estimated_cost or 0)}


@router.put("/{claim_id}/submit", summary="Nhân viên gửi phiếu lên admin duyệt")
def submit_claim(claim_id: int, db: Session = Depends(get_db)):
    claim = claim_service.update_status(db, claim_id, ClaimStatus.submitted)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return {"message": "Claim submitted"}


@router.put("/{claim_id}/approve", summary="Admin duyệt phiếu và nhập chi phí được duyệt")
def approve_claim(claim_id: int, approved_cost: float = Body(..., embed=True), db: Session = Depends(get_db)):
    approver_id = "11"
    claim = claim_service.update_status(db, claim_id, ClaimStatus.approved, approver_id, approved_cost)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found or deleted")
    return {"message": "Claim approved", "approved_cost": float(claim.approved_cost or 0)}


@router.put("/{claim_id}/reject", summary="Admin từ chối phiếu bảo hành (xóa phiếu)")
def reject_claim(claim_id: int, db: Session = Depends(get_db)):
    approver_id = "11"
    claim_service.update_status(db, claim_id, ClaimStatus.rejected, approver_id)
    return {"message": "Claim rejected and removed"}


@router.get("/", summary="Danh sách phiếu bảo hành (lọc theo quyền)")
def list_claims(role: str = Query("user"), user_id: str = Query("01"), db: Session = Depends(get_db)):
    return claim_service.list_claims(db, user_id, role)


@router.get("/history", summary="Lịch sử các thao tác phiếu")
def get_history(role: str = Query("user"), user_id: str = Query("01"), db: Session = Depends(get_db)):
    return claim_service.list_history(db, user_id, role)
