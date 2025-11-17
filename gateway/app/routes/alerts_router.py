# File: gateway/app/routes/alert_router.py

import os
from fastapi import APIRouter, Request
from app.middleware.role_guard import require_roles
from app.utils.proxy import proxy_request 

router = APIRouter(
    tags=["Alerts (Admin Only)"] 
)

# ✅ SỬA LỖI: Lấy BACKEND_URL từ biến môi trường
BACKEND_URL = os.getenv("BACKEND_URL")
ROLE_ADMIN = "Admin" 

@router.get("/")
@require_roles(ROLE_ADMIN) 
async def list_alerts(request: Request):
    # ✅ SỬA LỖI: Truyền vào BACKEND_URL
    return await proxy_request(request, BACKEND_URL)

@router.post("/")
@require_roles(ROLE_ADMIN) 
async def create_alert(request: Request):
    # ✅ SỬA LỖI: Truyền vào BACKEND_URL
    return await proxy_request(request, BACKEND_URL)

@router.get("/{alert_id}")
@require_roles(ROLE_ADMIN) 
async def get_alert(request: Request):
    # ✅ SỬA LỖI: Truyền vào BACKEND_URL
    return await proxy_request(request, BACKEND_URL)

@router.put("/{alert_id}")
@require_roles(ROLE_ADMIN) 
async def update_alert(request: Request):
    # ✅ SỬA LỖI: Truyền vào BACKEND_URL
    return await proxy_request(request, BACKEND_URL)

@router.delete("/{alert_id}")
@require_roles(ROLE_ADMIN) 
async def delete_alert(request: Request):
    # ✅ SỬA LỖI: Truyền vào BACKEND_URL
    return await proxy_request(request, BACKEND_URL)