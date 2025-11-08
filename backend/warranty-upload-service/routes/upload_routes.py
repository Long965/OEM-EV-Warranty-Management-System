from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.schema import WarrantyUploadCreate
from services import upload_service
import uuid

router = APIRouter(prefix="/uploads", tags=["Warranty Uploads"])

@router.post("/", summary="Tạo phiếu bảo hành (nhân viên)")
def create_upload(data: WarrantyUploadCreate, db: Session = Depends(get_db)):
    user_id = uuid.uuid4()  # 🔧 sau này thay bằng user từ Auth
    upload = upload_service.create_upload(db, data, user_id)
    return {"message": "Upload created", "upload_id": upload.id}

@router.put("/{upload_id}/submit", summary="Nhân viên gửi phiếu lên admin duyệt")
def submit_upload(upload_id: str, db: Session = Depends(get_db)):
    upload = upload_service.submit_upload(db, upload_id)
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    return {"message": "Submitted", "status": upload.status}

@router.put("/{upload_id}/approve", summary="Admin duyệt phiếu")
def approve_upload(upload_id: str, db: Session = Depends(get_db)):
    approver_id = uuid.uuid4()  # 🔧 sau này thay bằng user_id thật từ Auth Service
    upload = upload_service.approve_upload(db, upload_id, approver_id)
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    return {"message": "Approved", "status": upload.status}
