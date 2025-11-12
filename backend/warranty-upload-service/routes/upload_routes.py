import os
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from database import get_db
from models.schema import WarrantyUploadCreate, WarrantyUploadReject, WarrantyUploadApprove
from services import upload_service
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI

router = APIRouter(prefix="/uploads", tags=["Warranty Uploads"])

# 🟢 Nhân viên tạo phiếu bảo hành
@router.post("/", summary="Nhân viên tạo phiếu bảo hành")
def create_upload(data: WarrantyUploadCreate, db: Session = Depends(get_db)):
    user_id = "11111111-1111-1111-1111-111111111111"
    upload = upload_service.create_upload(db, data, user_id)
    return {"message": "Upload created", "upload_id": upload.id}

# 🟡 Nhân viên gửi phiếu lên hãng
@router.put("/{upload_id}/submit", summary="Nhân viên gửi phiếu lên admin duyệt")
def submit_upload(upload_id: int, db: Session = Depends(get_db)):
    upload = upload_service.submit_upload(db, upload_id)
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    return {"message": "Phiếu đã gửi", "status": upload.status}

# 📜 Danh sách phiếu
@router.get("/", summary="Danh sách phiếu bảo hành")
def list_uploads(created_by: str = Query(None), db: Session = Depends(get_db)):
    uploads = upload_service.list_uploads(db, created_by)
    return uploads


# 📁 Upload file
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

