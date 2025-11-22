import os
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Header
from sqlalchemy.orm import Session
from database import get_db
from models.schema import WarrantyUploadCreate
from models.upload_model import WarrantyUpload
from services import upload_service
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI

router = APIRouter(prefix="/uploads", tags=["Warranty Uploads"])

USER_ROLES = ["SC_Staff", "SC_Technician", "EVM_Staff"]

@router.post("/")
def create_upload(
    data: WarrantyUploadCreate,
    db: Session = Depends(get_db),
    user_id: str = Header(None, alias="x-user-id"),
    role: str = Header(None, alias="x-user-role")
):
    if role not in USER_ROLES:
        raise HTTPException(403, "Only user roles can create upload")
    upload = upload_service.create_upload(db, data, user_id, role)
    return {"message": "Upload created", "upload_id": upload.id}

@router.get("/{upload_id}")
def get_upload(
    upload_id: int,
    db: Session = Depends(get_db),
    user_id: str = Header(None, alias="x-user-id"),
    role: str = Header(None, alias="x-user-role")
):
    upload = db.query(WarrantyUpload).filter(WarrantyUpload.id == upload_id).first()
    if not upload:
        raise HTTPException(404, "Upload not found")

    if role != "Admin" and upload.created_by != user_id:
        raise HTTPException(403, "Permission denied")

    return upload

@router.put("/{upload_id}")
def update_upload(
    upload_id: int,
    data: WarrantyUploadCreate,
    db: Session = Depends(get_db),
    user_id: str = Header(None, alias="x-user-id"),
    role: str = Header(None, alias="x-user-role")
):
    if role not in USER_ROLES:
        raise HTTPException(403, "Only user roles can update upload")
    upload = db.query(WarrantyUpload).filter(WarrantyUpload.id == upload_id).first()
    if not upload:
        raise HTTPException(404, "Upload not found")
    if upload.created_by != user_id:
        raise HTTPException(403, "Permission denied")
    
    updated = upload_service.update_upload(db, upload_id, data, user_id, role)
    if not updated:
        raise HTTPException(400, "Update failed or not allowed")
    return {"message": "Upload updated successfully", "upload_id": updated.id}

@router.delete("/{upload_id}")
def delete_upload(
    upload_id: int,
    db: Session = Depends(get_db),
    user_id: str = Header(None, alias="x-user-id"),
    role: str = Header(None, alias="x-user-role")
):
    if role not in USER_ROLES:
        raise HTTPException(403, "Only user roles can delete upload")
    upload = db.query(WarrantyUpload).filter(WarrantyUpload.id == upload_id).first()
    if not upload:
        raise HTTPException(404, "Upload not found")
    if upload.created_by != user_id:
        raise HTTPException(403, "Permission denied")
    
    success = upload_service.delete_upload(db, upload_id, user_id, role)
    if not success:
        raise HTTPException(400, "Delete failed or not allowed")
    return {"message": "Upload deleted successfully"}

@router.put("/{upload_id}/submit")
def submit_upload(
    upload_id: int,
    db: Session = Depends(get_db),
    user_id: str = Header(None, alias="x-user-id"),
    role: str = Header(None, alias="x-user-role"),
):
    if role not in USER_ROLES:
        raise HTTPException(403, "Only user roles can submit upload")

    submit = upload_service.submit_upload(db, upload_id, user_id, role)
    if not submit:
        raise HTTPException(400, "Submit failed")

    return {"message": "Phiếu đã gửi", "status": submit.status}

@router.get("/")
def list_uploads(
    db: Session = Depends(get_db),
    user_id: str = Header(None, alias="x-user-id"),
    role: str = Header(None, alias="x-user-role")
):
    uploads = upload_service.list_uploads_by_role(db, user_id, role)
    return uploads

@router.put("/{upload_id}/sync-status")
def sync_status(
    upload_id: int,
    status: str,
    db: Session = Depends(get_db)
):
    upload = upload_service.sync_status_from_claim(db, upload_id, status)
    if not upload:
        raise HTTPException(404, "Upload not found")

    return {"message": "Status synced", "status": upload.status}

@router.get("/history/user")
def user_history(
    db: Session = Depends(get_db),
    user_id: str = Header(None, alias="x-user-id"),
    role: str = Header(None, alias="x-user-role")
):

    if role not in USER_ROLES:
        raise HTTPException(403, "Only user roles can view their history")
    return upload_service.list_user_history(db, user_id)

@router.get("/history/admin")
def admin_history(
    db: Session = Depends(get_db),
    role: str = Header(None, alias="x-user-role")
):
    if role != "Admin":
        raise HTTPException(403, "Only Admin can view upload history")

    return upload_service.list_admin_history(db)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/files")
async def upload_files(
    files: list[UploadFile] = File(...),
    role: str = Header(None, alias="x-user-role")
):
    if role not in USER_ROLES:
        raise HTTPException(403, "Only user roles can upload files")

    saved_files = []
    for file in files:
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        safe_name = f"{timestamp}_{uuid.uuid4().hex}_{file.filename}"
        file_path = os.path.join(UPLOAD_DIR, safe_name)

        with open(file_path, "wb") as f:
            f.write(await file.read())

        saved_files.append({
            "name": file.filename,
            "url": f"/uploads/{safe_name}",
            "type": file.content_type
        })

    return {"message": "Files uploaded successfully", "files": saved_files}
