from fastapi import APIRouter, HTTPException, Request
import httpx
import os

router = APIRouter(tags=["Warranty Upload"])
UPLOAD_SERVICE_URL = os.getenv("UPLOAD_SERVICE_URL", "http://warranty-upload-service:8083")


@router.post("/", summary="Nhân viên tạo phiếu bảo hành (proxy)")
async def create_upload(request: Request):
    """
    Proxy POST /uploads/ → chuyển tiếp tới warranty-upload-service.
    """
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


@router.put("/{upload_id}/submit", summary="Nhân viên gửi phiếu bảo hành (proxy)")
async def submit_upload(upload_id: str):
    """
    Proxy PUT /uploads/{upload_id}/submit → chuyển tiếp tới upload service.
    """
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


@router.get("/", summary="Danh sách phiếu bảo hành (proxy)")
async def list_uploads():
    """
    Proxy GET /uploads → chuyển tiếp tới upload service.
    """
    async with httpx.AsyncClient(follow_redirects=True) as client:
        resp = await client.get(f"{UPLOAD_SERVICE_URL}/uploads/")

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
