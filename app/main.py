# app/main.py
import os
from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from . import database, models, schemas, crud, auth
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import shutil

app = FastAPI(title="Warranty Claim Service")

UPLOAD_DIR = Path(__file__).parent / "uploads"
# ✅ Kiểm tra nếu chưa tồn tại mới tạo
if not UPLOAD_DIR.exists():
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
# Mount static folder
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# create tables
models.Base.metadata.create_all(bind=database.engine)

# Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Auth endpoints - token
@app.post("/auth/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect credentials")
    token = auth.create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}

# simple seed user endpoint (for demo only)
@app.post("/auth/seed")
def seed(db: Session = Depends(get_db)):
    from .auth import get_password_hash
    if db.query(models.User).count() == 0:
        admin = models.User(name="Admin", email="admin@example.com", hashed_password=get_password_hash("admin123"), role="ADMIN")
        evm = models.User(name="EVM Staff", email="evm@example.com", hashed_password=get_password_hash("evm123"), role="EVM_STAFF")
        sc = models.User(name="SC Staff", email="sc@example.com", hashed_password=get_password_hash("sc123"), role="SC_STAFF")
        tech = models.User(name="Tech", email="tech@example.com", hashed_password=get_password_hash("tech123"), role="TECHNICIAN")
        db.add_all([admin, evm, sc, tech])
        db.commit()
    return {"ok": True}

# Create claim
@app.post("/claims", response_model=schemas.WarrantyClaimOut, status_code=201)
def create_claim(payload: schemas.WarrantyClaimCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    # only SC staff or technician can create
    if current_user.role not in ("SC_STAFF","TECHNICIAN","ADMIN"):
        raise HTTPException(status_code=403, detail="Not allowed")
    claim = crud.create_claim(db, payload, current_user.user_id)
    return claim

@app.get("/claims/{claim_id}", response_model=schemas.WarrantyClaimOut)
def get_claim(claim_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    claim = crud.get_claim(db, claim_id)
    if not claim:
        raise HTTPException(404, "Claim not found")
    return claim

@app.get("/claims", response_model=list[schemas.WarrantyClaimOut])
def list_claims(skip: int = 0, limit: int = 50, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    q = db.query(models.WarrantyClaim).offset(skip).limit(limit).all()
    return q

# submit
@app.put("/claims/{claim_id}/submit", response_model=schemas.WarrantyClaimOut)
def submit(claim_id: str, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    claim = crud.get_claim(db, claim_id)
    if not claim:
        raise HTTPException(404, "Claim not found")
    if claim.created_by != current_user.user_id:
        raise HTTPException(403, "Only creator can submit")
    try:
        claim = crud.submit_claim(db, claim, current_user.user_id)
    except ValueError as e:
        raise HTTPException(400, str(e))
    return claim

# approve
@app.put("/claims/{claim_id}/approve", response_model=schemas.WarrantyClaimOut)
def approve(claim_id: str, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    if current_user.role not in ("EVM_STAFF","ADMIN"):
        raise HTTPException(403, "Not allowed")
    claim = crud.get_claim(db, claim_id)
    if not claim:
        raise HTTPException(404, "Claim not found")
    try:
        claim = crud.approve_claim(db, claim, current_user.user_id)
    except ValueError as e:
        raise HTTPException(400, str(e))
    return claim

# reject
@app.put("/claims/{claim_id}/reject", response_model=schemas.WarrantyClaimOut)
def reject(claim_id: str, reason: str = Form(None), current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    if current_user.role not in ("EVM_STAFF","ADMIN"):
        raise HTTPException(403, "Not allowed")
    claim = crud.get_claim(db, claim_id)
    if not claim:
        raise HTTPException(404, "Claim not found")
    try:
        claim = crud.reject_claim(db, claim, current_user.user_id, reason)
    except ValueError as e:
        raise HTTPException(400, str(e))
    return claim

# complete
@app.put("/claims/{claim_id}/complete", response_model=schemas.WarrantyClaimOut)
def complete(claim_id: str, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    if current_user.role not in ("SC_STAFF","TECHNICIAN","ADMIN"):
        raise HTTPException(403, "Not allowed")
    claim = crud.get_claim(db, claim_id)
    if not claim:
        raise HTTPException(404, "Claim not found")
    try:
        claim = crud.complete_claim(db, claim)
    except ValueError as e:
        raise HTTPException(400, str(e))
    return claim

# upload attachment
@app.post("/claims/{claim_id}/attachments", response_model=schemas.ClaimAttachmentOut)
def upload_attachment(claim_id: str, file: UploadFile = File(...), current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    claim = crud.get_claim(db, claim_id)
    if not claim:
        raise HTTPException(404, "Claim not found")
    # store file
    filename = f"{claim_id}_{file.filename}"
    dest = UPLOAD_DIR / filename
    with dest.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    att = crud.add_attachment(db, claim, f"/uploads/{filename}", file.content_type)
    return att

# set cost (create or update)
@app.post("/claims/{claim_id}/cost", response_model=schemas.ClaimCostOut)
def set_cost(claim_id: str, payload: schemas.ClaimCostIn, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    # only EVM staff or admin can set cost (for demo allow assigner)
    if current_user.role not in ("EVM_STAFF","ADMIN"):
        raise HTTPException(403, "Not allowed")
    claim = crud.get_claim(db, claim_id)
    if not claim:
        raise HTTPException(404, "Claim not found")
    cost = crud.set_cost(db, claim, payload.labor_cost, payload.part_cost, approver_id=current_user.user_id)
    return cost
