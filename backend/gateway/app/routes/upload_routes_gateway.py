from fastapi import APIRouter, HTTPException, Request, Query
import httpx
import os
import jwt

router = APIRouter(prefix="/uploads", tags=["Warranty Upload Gateway"])
UPLOAD_SERVICE_URL = os.getenv("UPLOAD_SERVICE_URL", "http://warranty-upload-service:8083")

JWT_SECRET = os.getenv("JWT_SECRET", "default-secret")
JWT_ALGORITHM = "HS256"


def decode_token(request: Request):
    auth = request.headers.get("Authorization")
    if not auth:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    token = auth.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


# --------------------------------------------
# CREATE UPLOAD
# --------------------------------------------
@router.post("/", summary="Create Upload (proxy)")
async def create_upload(request: Request):
    user = decode_token(request)
    data = await request.json()

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{UPLOAD_SERVICE_URL}/uploads/",
            json=data,
            headers={
                "x-user-id": user["sub"],
                "x-user-role": user["role"]
            }
        )

    if resp.status_code >= 400:
        raise HTTPException(resp.status_code, resp.text)
    return resp.json()


# --------------------------------------------
# LIST UPLOADS
# --------------------------------------------
@router.get("/", summary="List Uploads")
async def list_uploads(request: Request):
    user = decode_token(request)

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{UPLOAD_SERVICE_URL}/uploads/",
            headers={
                "x-user-id": user["sub"],
                "x-user-role": user["role"]
            }
        )

    if resp.status_code >= 400:
        raise HTTPException(resp.status_code, resp.text)
    return resp.json()


# --------------------------------------------
# GET SINGLE UPLOAD
# --------------------------------------------
@router.get("/{upload_id}", summary="Get Upload (proxy)")
async def get_upload(upload_id: int, request: Request):
    user = decode_token(request)

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{UPLOAD_SERVICE_URL}/uploads/{upload_id}",
            headers={
                "x-user-id": user["sub"],
                "x-user-role": user["role"]
            }
        )

    if resp.status_code >= 400:
        raise HTTPException(resp.status_code, resp.text)
    return resp.json()


# --------------------------------------------
# UPDATE UPLOAD
# --------------------------------------------
@router.put("/{upload_id}", summary="Update Upload (proxy)")
async def update_upload(upload_id: int, request: Request):
    user = decode_token(request)
    data = await request.json()

    async with httpx.AsyncClient() as client:
        resp = await client.put(
            f"{UPLOAD_SERVICE_URL}/uploads/{upload_id}",
            json=data,
            headers={
                "x-user-id": user["sub"],
                "x-user-role": user["role"]
            }
        )

    if resp.status_code >= 400:
        raise HTTPException(resp.status_code, resp.text)
    return resp.json()


# --------------------------------------------
# DELETE UPLOAD
# --------------------------------------------
@router.delete("/{upload_id}", summary="Delete Upload (proxy)")
async def delete_upload(upload_id: int, request: Request):
    user = decode_token(request)

    async with httpx.AsyncClient() as client:
        resp = await client.delete(
            f"{UPLOAD_SERVICE_URL}/uploads/{upload_id}",
            headers={
                "x-user-id": user["sub"],
                "x-user-role": user["role"]
            }
        )

    if resp.status_code >= 400:
        raise HTTPException(resp.status_code, resp.text)
    return resp.json()


# --------------------------------------------
# SUBMIT UPLOAD
# --------------------------------------------
@router.put("/{upload_id}/submit", summary="Submit Upload (proxy)")
async def submit_upload(upload_id: int, request: Request):
    user = decode_token(request)

    async with httpx.AsyncClient() as client:
        resp = await client.put(
            f"{UPLOAD_SERVICE_URL}/uploads/{upload_id}/submit",
            headers={
                "x-user-id": user["sub"],
                "x-user-role": user["role"]
            }
        )

    if resp.status_code >= 400:
        raise HTTPException(resp.status_code, resp.text)
    return resp.json()


# --------------------------------------------
# SYNC STATUS FROM CLAIM SERVICE
# --------------------------------------------
@router.put("/{upload_id}/sync-status", summary="Sync Status (proxy)")
async def sync_status(upload_id: int, status: str, request: Request):
    user = decode_token(request)

    async with httpx.AsyncClient() as client:
        resp = await client.put(
            f"{UPLOAD_SERVICE_URL}/uploads/{upload_id}/sync-status",
            params={"status": status},
            headers={
                "x-user-id": user["sub"],
                "x-user-role": user["role"]
            }
        )

    if resp.status_code >= 400:
        raise HTTPException(resp.status_code, resp.text)
    return resp.json()


# --------------------------------------------
# FILE UPLOAD (proxy)
# --------------------------------------------
@router.post("/files", summary="Upload Files (proxy)")
async def upload_files(request: Request):
    user = decode_token(request)
    form = await request.form()

    files = []
    for key, value in form.items():
        if hasattr(value, "file"):
            files.append(('files', (value.filename, value.file, value.content_type)))

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{UPLOAD_SERVICE_URL}/uploads/files",
            files=files,
            headers={
                "x-user-id": user["sub"],
                "x-user-role": user["role"]
            }
        )

    if resp.status_code >= 400:
        raise HTTPException(resp.status_code, resp.text)
    return resp.json()

@router.get("/history/user", summary="Get User Upload History (proxy)")
async def user_history(request: Request):
    user = decode_token(request)
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{UPLOAD_SERVICE_URL}/uploads/history/user",
            headers={
                "x-user-id": user["sub"],
                "x-user-role": user["role"]
            }
        )
    if resp.status_code >= 400:
        raise HTTPException(resp.status_code, resp.text)
    return resp.json()