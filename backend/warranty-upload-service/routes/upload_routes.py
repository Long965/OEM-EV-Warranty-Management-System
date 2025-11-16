import os
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from database import get_db
from models.schema import WarrantyUploadCreate, WarrantyUploadReject, WarrantyUploadApprove
from models.upload_model import WarrantyUpload
from services import upload_service
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI

router = APIRouter(prefix="/uploads", tags=["Warranty Uploads"])

@router.post("/", summary="Nhân viên tạo phiếu bảo hành")
def create_upload(data: WarrantyUploadCreate, db: Session = Depends(get_db)):
    user_id = "11111111-1111-1111-1111-111111111111"
    upload = upload_service.create_upload(db, data, user_id)
    return {"message": "Upload created", "upload_id": upload.id}

@router.get("/{upload_id}", summary="Lấy chi tiết phiếu bảo hành")
def get_upload(upload_id: int, db: Session = Depends(get_db)):
    """Get single upload details for editing"""
    upload = db.query(WarrantyUpload).filter(WarrantyUpload.id == upload_id).first()
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    return upload

@router.put("/{upload_id}", summary="Chỉnh sửa phiếu bảo hành")
def update_upload(upload_id: int, data: WarrantyUploadCreate, db: Session = Depends(get_db)):
    """Update upload details - only allowed before submission"""
    upload = upload_service.update_upload(db, upload_id, data)
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    return {"message": "Upload updated successfully", "upload_id": upload.id}

@router.delete("/{upload_id}", summary="Xóa phiếu bảo hành")
def delete_upload(upload_id: int, db: Session = Depends(get_db)):
    """Delete upload - only allowed before submission"""
    success = upload_service.delete_upload(db, upload_id)
    if not success:
        raise HTTPException(status_code=404, detail="Upload not found or cannot be deleted")
    return {"message": "Upload deleted successfully"}

@router.put("/{upload_id}/submit", summary="Nhân viên gửi phiếu lên admin duyệt")
def submit_upload(upload_id: int, db: Session = Depends(get_db)):
    upload = upload_service.submit_upload(db, upload_id)
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    return {"message": "Phiếu đã gửi", "status": upload.status}

@router.put("/{upload_id}/sync-status", summary="Đồng bộ trạng thái từ Claim Service")
def sync_status(upload_id: int, status: str = Query(...), db: Session = Depends(get_db)):
    """Sync status from claim service when approved/rejected"""
    upload = upload_service.sync_status_from_claim(db, upload_id, status)
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    return {"message": "Status synced", "status": upload.status}

@router.get("/", summary="Danh sách phiếu bảo hành")
def list_uploads(created_by: str = Query(None), db: Session = Depends(get_db)):
    uploads = upload_service.list_uploads(db, created_by)
    return uploads

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/files", summary="Upload file hoặc hình ảnh bảo hành")
async def upload_files(files: list[UploadFile] = File(...)):
    saved_files = []
    for file in files:
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        safe_name = f"{timestamp}_{uuid.uuid4().hex}_{file.filename}"
        file_path = os.path.join(UPLOAD_DIR, safe_name)

        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)

        saved_files.append({
            "name": file.filename,
            "url": f"/uploads/{safe_name}",
            "type": file.content_type
        })

    return {"message": "Files uploaded successfully", "files": saved_files}

def setup_static(app: FastAPI):
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")