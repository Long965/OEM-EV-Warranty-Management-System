from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from models.schema import WarrantyClaimCreate
from models.claim_model import ClaimStatus, WarrantyClaim
from services import claim_service
from database import get_db

router = APIRouter(prefix="/claims", tags=["Warranty Claims"])


# ----------------------------------------
# CREATE CLAIM (ONLY USER: SC Staff, SC Technician, EVM Staff)
# ----------------------------------------
@router.post("/")
def create_claim(
    data: WarrantyClaimCreate,
    db: Session = Depends(get_db),
    user_id: str = Header(None, alias="x-user-id"),
    role: str = Header(None, alias="x-user-role")
):

    if role == "Admin":
        raise HTTPException(403, "Admin cannot create claim")

    claim = claim_service.create_claim(db, data, user_id, role)
    return {"message": "Created", "claim_id": claim.id}



# ----------------------------------------
# APPROVE CLAIM (ONLY ADMIN)
# ----------------------------------------
@router.put("/{claim_id}/approve")
def approve_claim(
    claim_id: int,
    db: Session = Depends(get_db),
    admin_id: str = Header(None, alias="x-user-id"),
    role: str = Header(None, alias="x-user-role")
):
    if role != "Admin":
        raise HTTPException(403, "Only Admin can approve a claim")

    claim = claim_service.update_status(db, claim_id, ClaimStatus.approved, admin_id)
    if not claim:
        raise HTTPException(404, "Claim not found")

    return {"message": "Claim approved"}



# ----------------------------------------
# REJECT CLAIM (ONLY ADMIN)
# ----------------------------------------
@router.put("/{claim_id}/reject")
def reject_claim(
    claim_id: int,
    db: Session = Depends(get_db),
    admin_id: str = Header(None, alias="x-user-id"),
    role: str = Header(None, alias="x-user-role")
):
    if role != "Admin":
        raise HTTPException(403, "Only Admin can reject a claim")

    claim = claim_service.update_status(db, claim_id, ClaimStatus.rejected, admin_id)
    if not claim:
        raise HTTPException(404, "Claim not found")

    return {"message": "Claim rejected"}



# ----------------------------------------
# LIST CLAIMS
# USER → chỉ xem claim của chính mình
# ADMIN → xem tất cả
# ----------------------------------------
@router.get("/")
def list_claims(
    db: Session = Depends(get_db),
    user_id: str = Header(None, alias="x-user-id"),
    role: str = Header(None, alias="x-user-role")
):
    claims = claim_service.list_claims(db, user_id, role)
    return claims



# ----------------------------------------
# CLAIM HISTORY
# USER → chỉ xem history do chính họ thực hiện
# ADMIN → xem tất cả
# ----------------------------------------
@router.get("/history")
def get_history(
    db: Session = Depends(get_db),
    user_id: str = Header(None, alias="x-user-id"),
    role: str = Header(None, alias="x-user-role")
):
    history = claim_service.list_history(db, user_id, role)
    return history



# ----------------------------------------
# GET SINGLE CLAIM
# USER → chỉ xem claim của mình
# ADMIN → xem tất cả
# ----------------------------------------
@router.get("/{claim_id}")
def get_claim(
    claim_id: int,
    db: Session = Depends(get_db),
    user_id: str = Header(None, alias="x-user-id"),
    role: str = Header(None, alias="x-user-role")
):
    claim = claim_service.get_claim_by_permission(db, claim_id, user_id, role)
    if not claim:
        raise HTTPException(404, "Claim not found or access denied")

    return claim



# ----------------------------------------
# UPDATE CLAIM
# ONLY ADMIN
# ----------------------------------------
@router.put("/{claim_id}")
def update_claim(
    claim_id: int,
    data: WarrantyClaimCreate,
    db: Session = Depends(get_db),
    admin_id: str = Header(None, alias="x-user-id"),
    role: str = Header(None, alias="x-user-role")
):
    if role != "Admin":
        raise HTTPException(403, "Only Admin can update claim")

    claim = claim_service.update_claim(db, claim_id, data, admin_id)
    if not claim:
        raise HTTPException(404, "Claim not found")

    return {"message": "Claim updated successfully"}



# ----------------------------------------
# DELETE CLAIM
# ONLY ADMIN
# ----------------------------------------
@router.delete("/{claim_id}")
def delete_claim(
    claim_id: int,
    db: Session = Depends(get_db),
    role: str = Header(None, alias="x-user-role")
):
    if role != "Admin":
        raise HTTPException(403, "Only Admin can delete claim")

    success = claim_service.delete_claim(db, claim_id)
    if not success:
        raise HTTPException(404, "Claim not found or cannot be deleted")

    return {"message": "Claim deleted successfully"}
