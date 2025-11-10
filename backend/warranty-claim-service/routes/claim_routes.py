from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.schema import WarrantyClaimCreate, ClaimStatus
from services import claim_service
from database import get_db
from uuid import UUID

router = APIRouter(prefix="/claims", tags=["Warranty Claims"])

# 1️⃣ API nội bộ: upload-service gửi phiếu sang claim-service
@router.post("/", summary="Nhận claim mới từ Upload Service")
def create_claim(data: WarrantyClaimCreate, db: Session = Depends(get_db)):
    user_id = UUID("11111111-1111-1111-1111-111111111111")
    claim = claim_service.create_claim(db, data, user_id)
    return {"message": "Claim created", "claim_id": str(claim.id)}

# 2️⃣ Admin duyệt phiếu bảo hành
@router.put("/{claim_id}/approve", summary="Admin duyệt phiếu bảo hành")
def approve_claim(claim_id: UUID, db: Session = Depends(get_db)):
    approver_id = UUID("22222222-2222-2222-2222-222222222222")
    claim = claim_service.update_status(db, claim_id, ClaimStatus.approved, approver_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return {"message": "Claim approved"}

# 3️⃣ Admin từ chối phiếu bảo hành
@router.put("/{claim_id}/reject", summary="Admin từ chối phiếu bảo hành")
def reject_claim(claim_id: UUID, db: Session = Depends(get_db)):
    claim = claim_service.update_status(db, claim_id, ClaimStatus.draft)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return {"message": "Claim rejected"}

# 4️⃣ Danh sách claim
@router.get("/", summary="Danh sách phiếu bảo hành")
def list_claims(db: Session = Depends(get_db)):
    claims = db.query(claim_service.WarrantyClaim).all()
    return claims
