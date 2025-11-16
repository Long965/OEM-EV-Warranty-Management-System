from fastapi import APIRouter, HTTPException, Request, Query
import httpx
import os

router = APIRouter(prefix="/uploads", tags=["Warranty Upload Gateway"])
UPLOAD_SERVICE_URL = os.getenv("UPLOAD_SERVICE_URL", "http://warranty-upload-service:8083")

@router.post("/", summary="Nhân viên tạo phiếu bảo hành (proxy)")
async def create_upload(request: Request):
    """Proxy POST /uploads/ → chuyển tiếp tới warranty-upload-service"""
    data = await request.json()
    async with httpx.AsyncClient(follow_redirects=True) as client:
        resp = await client.post(f"{UPLOAD_SERVICE_URL}/uploads/", json=data)

    if resp.status_code >= 400:
        raise HTTPException(
            status_code=resp.status_code,
            detail=f"Upload Service Error: {resp.text}"
        )

    try:
        return resp.json()
    except Exception:
        raise HTTPException(
            status_code=500,
            detail=f"Upload Service returned non-JSON: {resp.text}"
        )

@router.get("/", summary="Danh sách phiếu bảo hành (proxy)")
async def list_uploads(created_by: str = Query(None)):
    """Proxy GET /uploads → chuyển tiếp tới upload service"""
    params = {}
    if created_by:
        params["created_by"] = created_by
    
    async with httpx.AsyncClient(follow_redirects=True) as client:
        resp = await client.get(f"{UPLOAD_SERVICE_URL}/uploads/", params=params)

    if resp.status_code >= 400:
        raise HTTPException(
            status_code=resp.status_code,
            detail=f"Upload Service Error: {resp.text}"
        )

    try:
        return resp.json()
    except Exception:
        raise HTTPException(
            status_code=500,
            detail=f"Non-JSON from Upload Service: {resp.text}"
        )

@router.get("/{upload_id}", summary="Lấy chi tiết phiếu (proxy)")
async def get_upload(upload_id: int):
    """Proxy GET /uploads/{id} → get single upload"""
    async with httpx.AsyncClient(follow_redirects=True) as client:
        resp = await client.get(f"{UPLOAD_SERVICE_URL}/uploads/{upload_id}")

    if resp.status_code >= 400:
        raise HTTPException(
            status_code=resp.status_code,
            detail=f"Upload Service Error: {resp.text}"
        )

    try:
        return resp.json()
    except Exception:
        raise HTTPException(
            status_code=500,
            detail=f"Non-JSON from Upload Service: {resp.text}"
        )

@router.put("/{upload_id}", summary="Chỉnh sửa phiếu (proxy)")
async def update_upload(upload_id: int, request: Request):
    """Proxy PUT /uploads/{id} → update upload"""
    data = await request.json()
    async with httpx.AsyncClient(follow_redirects=True) as client:
        resp = await client.put(
            f"{UPLOAD_SERVICE_URL}/uploads/{upload_id}",
            json=data
        )

    if resp.status_code >= 400:
        raise HTTPException(
            status_code=resp.status_code,
            detail=f"Upload Service Error: {resp.text}"
        )

    try:
        return resp.json()
    except Exception:
        raise HTTPException(
            status_code=500,
            detail=f"Non-JSON from Upload Service: {resp.text}"
        )

@router.delete("/{upload_id}", summary="Xóa phiếu (proxy)")
async def delete_upload(upload_id: int):
    """Proxy DELETE /uploads/{id} → delete upload"""
    async with httpx.AsyncClient(follow_redirects=True) as client:
        resp = await client.delete(f"{UPLOAD_SERVICE_URL}/uploads/{upload_id}")

    if resp.status_code >= 400:
        raise HTTPException(
            status_code=resp.status_code,
            detail=f"Upload Service Error: {resp.text}"
        )

    try:
        return resp.json()
    except Exception:
        raise HTTPException(
            status_code=500,
            detail=f"Non-JSON from Upload Service: {resp.text}"
        )

@router.put("/{upload_id}/submit", summary="Nhân viên gửi phiếu bảo hành (proxy)")
async def submit_upload(upload_id: int):
    """Proxy PUT /uploads/{upload_id}/submit → chuyển tiếp tới upload service"""
    async with httpx.AsyncClient(follow_redirects=True) as client:
        resp = await client.put(f"{UPLOAD_SERVICE_URL}/uploads/{upload_id}/submit")

    if resp.status_code >= 400:
        raise HTTPException(
            status_code=resp.status_code,
            detail=f"Upload Service Error: {resp.text}"
        )

    try:
        return resp.json()
    except Exception:
        raise HTTPException(
            status_code=500,
            detail=f"Non-JSON from Upload Service: {resp.text}"
        )

@router.put("/{upload_id}/sync-status", summary="Đồng bộ trạng thái (proxy)")
async def sync_status(upload_id: int, status: str = Query(...)):
    """Proxy status sync from claim service"""
    async with httpx.AsyncClient(follow_redirects=True) as client:
        resp = await client.put(
            f"{UPLOAD_SERVICE_URL}/uploads/{upload_id}/sync-status",
            params={"status": status}
        )

    if resp.status_code >= 400:
        raise HTTPException(
            status_code=resp.status_code,
            detail=f"Upload Service Error: {resp.text}"
        )

    try:
        return resp.json()
    except Exception:
        raise HTTPException(
            status_code=500,
            detail=f"Non-JSON from Upload Service: {resp.text}"
        )

@router.post("/files", summary="Upload files (proxy)")
async def upload_files(request: Request):
    """Proxy file uploads"""
    # Note: For file uploads, we need to handle FormData differently
    form = await request.form()
    
    async with httpx.AsyncClient(follow_redirects=True) as client:
        files = []
        for key, value in form.items():
            if hasattr(value, 'file'):  # It's a file
                files.append(
                    ('files', (value.filename, value.file, value.content_type))
                )
        
        resp = await client.post(
            f"{UPLOAD_SERVICE_URL}/uploads/files",
            files=files
        )

    if resp.status_code >= 400:
        raise HTTPException(
            status_code=resp.status_code,
            detail=f"Upload Service Error: {resp.text}"
        )

    try:
        return resp.json()
    except Exception:
        raise HTTPException(
            status_code=500,
            detail=f"Non-JSON from Upload Service: {resp.text}"
        )