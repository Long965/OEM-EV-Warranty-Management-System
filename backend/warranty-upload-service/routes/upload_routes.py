from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models.schema import WarrantyUploadCreate, WarrantyUploadReject
from services import upload_service
import uuid

router = APIRouter(prefix="/uploads", tags=["Warranty Uploads"])


@router.post("/", summary="Nhân viên tạo phiếu bảo hành")
def create_upload(data: WarrantyUploadCreate, db: Session = Depends(get_db)):
    user_id = uuid.UUID("11111111-1111-1111-1111-111111111111")  # giả lập user từ JWT
    upload = upload_service.create_upload(db, data, user_id)
    return {"message": "Upload created", "upload_id": upload.id}


@router.put("/{upload_id}/submit", summary="Nhân viên gửi phiếu lên admin duyệt")
def submit_upload(upload_id: str, db: Session = Depends(get_db)):
    upload = upload_service.submit_upload(db, upload_id)
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    return {"message": "Submitted", "status": upload.status}


@router.put("/{upload_id}/approve", summary="Admin duyệt phiếu (tự sync sang Claim Service)")
def approve_upload(upload_id: str, db: Session = Depends(get_db)):
    approver_id = uuid.UUID("22222222-2222-2222-2222-222222222222")
    upload = upload_service.approve_upload(db, upload_id, approver_id)
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    return {"message": "Approved", "status": upload.status}


@router.put("/{upload_id}/reject", summary="Admin từ chối phiếu bảo hành")
def reject_upload(upload_id: str, data: WarrantyUploadReject, db: Session = Depends(get_db)):
    approver_id = uuid.UUID("22222222-2222-2222-2222-222222222222")
    upload = upload_service.reject_upload(db, upload_id, data.reason, approver_id)
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    return {"message": "Rejected", "reason": upload.reject_reason}


@router.get("/", summary="Danh sách phiếu (lọc theo user nếu cần)")
def list_uploads(created_by: str = Query(None), db: Session = Depends(get_db)):
    uploads = upload_service.list_uploads(db, created_by)
    return uploads

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)  # Tạo thư mục lưu file nếu chưa có

# -------------------- API UPLOAD FILE --------------------
@router.post("/files", summary="Upload file hoặc hình ảnh bảo hành (trả về URL)")
async def upload_files(files: list[UploadFile] = File(...)):
    saved_files = []
    for file in files:
        # tạo tên file an toàn: yyyyMMdd_uuid_filename
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

# Serve static files (để truy cập ảnh qua URL)
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI

def setup_static(app: FastAPI):
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")