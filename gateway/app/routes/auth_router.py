# File: gateway/app/routes/auth_router.py

import os
from fastapi import APIRouter, Request, HTTPException
from starlette.status import HTTP_503_SERVICE_UNAVAILABLE
from app.utils.proxy import proxy_request 

# ✅ SỬA LỖI: Xóa prefix="/auth" khỏi đây
router = APIRouter(
    tags=["Authentication"] 
)

# Lấy URL của dịch vụ Auth từ biến môi trường
AUTH_URL = os.getenv("AUTH_URL")

# ✅ SỬA LỖI: Thêm hàm kiểm tra ngay lập tức
def get_auth_url():
    if not AUTH_URL:
        # Nếu biến môi trường bị thiếu, báo lỗi 503
        raise HTTPException(
            status_code=HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service is not configured (AUTH_URL is missing)"
        )
    return AUTH_URL

@router.post("/login")
async def login(request: Request):
    """
    POST /login
    (Sẽ được gắn prefix /auth từ main.py)
    """
    auth_service_url = get_auth_url()
    return await proxy_request(request, auth_service_url)

@router.post("/register")
async def register(request: Request):
    """
    POST /register
    (Sẽ được gắn prefix /auth từ main.py)
    """
    auth_service_url = get_auth_url()
    return await proxy_request(request, auth_service_url)

# Bạn có thể thêm các endpoint khác của Auth (ví dụ: /refresh_token) nếu có
# @router.post("/refresh")
# async def refresh_token(request: Request):
#     auth_service_url = get_auth_url()
#     return await proxy_request(request, auth_service_url)