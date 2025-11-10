import os
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from database import get_db
from models.schema import WarrantyUploadCreate
from services import upload_service
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI

router = APIRouter(prefix="/uploads", tags=["Warranty Uploads"])

# 1️⃣ Nhân viên tạo phiếu bảo hành
@router.post("/", summary="Nhân viên tạo phiếu bảo hành")
def create_upload(data: WarrantyUploadCreate, db: Session = Depends(get_db)):
    user_id = uuid.UUID("11111111-1111-1111-1111-111111111111")  # Giả lập user từ Auth Service
    upload = upload_service.create_upload(db, data, user_id)
    return {"message": "Upload created", "upload_id": upload.id}


# 2️⃣ Nhân viên gửi phiếu bảo hành lên hãng (Admin)
@router.put("/{upload_id}/submit", summary="Nhân viên gửi phiếu lên admin duyệt")
def submit_upload(upload_id: str, db: Session = Depends(get_db)):
    upload = upload_service.submit_upload(db, upload_id)
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    return {"message": "Submitted", "status": upload.status}


# 3️⃣ Danh sách phiếu (lọc theo user)
@router.get("/", summary="Danh sách phiếu của nhân viên")
def list_uploads(created_by: str = Query(None), db: Session = Depends(get_db)):
    uploads = upload_service.list_uploads(db, created_by)
    return uploads


# -------------------- API UPLOAD FILE --------------------
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/files", summary="Upload file hoặc hình ảnh bảo hành (trả về URL)")
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


# Serve static files
def setup_static(app: FastAPI):
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
