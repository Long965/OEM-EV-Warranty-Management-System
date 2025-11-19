from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from models.schema import WarrantyClaimCreate
from models.claim_model import ClaimStatus
from services import claim_service
from database import get_db

router = APIRouter(prefix="/claims", tags=["Warranty Claims"])


# -------------------------------------------------------------
# 1. CREATE CLAIM (USER ONLY)
# -------------------------------------------------------------
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



# -------------------------------------------------------------
# 2. APPROVE CLAIM (ADMIN ONLY)
# -------------------------------------------------------------
@router.put("/{claim_id}/approve")
def approve_claim(
    claim_id: int,
    db: Session = Depends(get_db),
    admin_id: str = Header(None, alias="x-user-id"),
    role: str = Header(None, alias="x-user-role")
):
    if role != "Admin":
        raise HTTPException(403, "Only Admin can approve claims")

    claim = claim_service.update_status(db, claim_id, ClaimStatus.approved, admin_id, role)
    if not claim:
        raise HTTPException(404, "Claim not found")

    return {"message": "Claim approved"}



# -------------------------------------------------------------
# 3. REJECT CLAIM (ADMIN ONLY)
# -------------------------------------------------------------
@router.put("/{claim_id}/reject")
def reject_claim(
    claim_id: int,
    db: Session = Depends(get_db),
    admin_id: str = Header(None, alias="x-user-id"),
    role: str = Header(None, alias="x-user-role")
):
    if role != "Admin":
        raise HTTPException(403, "Only Admin can reject claims")

    claim = claim_service.update_status(db, claim_id, ClaimStatus.rejected, admin_id, role)
    if not claim:
        raise HTTPException(404, "Claim not found")

    return {"message": "Claim rejected"}



# -------------------------------------------------------------
# 4. LIST CLAIMS (USER → OWN, ADMIN → ALL)
# -------------------------------------------------------------
@router.get("/")
def list_claims(
    db: Session = Depends(get_db),
    user_id: str = Header(None, alias="x-user-id"),
    role: str = Header(None, alias="x-user-role")
):
    claims = claim_service.list_claims(db, user_id, role)
    return claims



# -------------------------------------------------------------
# 5. USER HISTORY (ONLY SEE OWN HISTORY)
# -------------------------------------------------------------
@router.get("/history/user")
def get_user_history(
    db: Session = Depends(get_db),
    user_id: str = Header(None, alias="x-user-id"),
    role: str = Header(None, alias="x-user-role")
):
    if role == "Admin":
        raise HTTPException(403, "Admin cannot view user history")

    history = claim_service.list_user_history(db, user_id)
    return history



# -------------------------------------------------------------
# 6. ADMIN HISTORY (ONLY SEE ADMIN HISTORY)
# -------------------------------------------------------------
@router.get("/history/admin")
def get_admin_history(
    db: Session = Depends(get_db),
    role: str = Header(None, alias="x-user-role")
):
    if role != "Admin":
        raise HTTPException(403, "Only Admin can view admin history")

    history = claim_service.list_admin_history(db)
    return history



# -------------------------------------------------------------
# 7. SINGLE CLAIM (USER → OWN, ADMIN → ALL)
# -------------------------------------------------------------
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



# -------------------------------------------------------------
# 8. UPDATE CLAIM (ADMIN ONLY)
# -------------------------------------------------------------
@router.put("/{claim_id}")
def update_claim(
    claim_id: int,
    data: WarrantyClaimCreate,
    db: Session = Depends(get_db),
    admin_id: str = Header(None, alias="x-user-id"),
    role: str = Header(None, alias="x-user-role")
):
    if role != "Admin":
        raise HTTPException(403, "Only Admin can update claims")

    claim = claim_service.update_claim(db, claim_id, data, admin_id, role)
    if not claim:
        raise HTTPException(404, "Claim not found")

    return {"message": "Claim updated successfully"}



# -------------------------------------------------------------
# 9. DELETE CLAIM (ADMIN ONLY, WITH HISTORY LOG)
# -------------------------------------------------------------
@router.delete("/{claim_id}")
def delete_claim(
    claim_id: int,
    db: Session = Depends(get_db),
    user_id: str = Header(None, alias="x-user-id"),
    role: str = Header(None, alias="x-user-role")
):
    if role != "Admin":
        raise HTTPException(403, "Only Admin can delete claims")

    success = claim_service.delete_claim(db, claim_id, user_id, role)
    if not success:
        raise HTTPException(404, "Claim not found or cannot be deleted")

    return {"message": "Claim deleted successfully"}
