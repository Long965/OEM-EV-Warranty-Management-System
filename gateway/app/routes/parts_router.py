# File: gateway/app/routes/parts_router.py

import os
from fastapi import APIRouter, Request
from app.middleware.role_guard import require_roles
from app.utils.part_proxy import proxy_request 

router = APIRouter( 
    tags=["Parts (Admin Only)"]
)

# ✅ SỬA LỖI: Lấy BACKEND_URL từ biến môi trường
BACKEND_URL = os.getenv("BACKEND_URL")
ROLE_ADMIN = "Admin" 

@router.get("/")
@require_roles(ROLE_ADMIN) 
async def list_parts(request: Request):
    # ✅ SỬA LỖI: Truyền vào BACKEND_URL
    return await proxy_request(request, BACKEND_URL)

@router.post("/")
@require_roles(ROLE_ADMIN) 
async def create_part(request: Request):
    # ✅ SỬA LỖI: Truyền vào BACKEND_URL
    return await proxy_request(request, BACKEND_URL)

@router.get("/{part_id}")
@require_roles(ROLE_ADMIN) 
async def get_part(request: Request):
    # ✅ SỬA LỖI: Truyền vào BACKEND_URL
    return await proxy_request(request, BACKEND_URL)

@router.put("/{part_id}")
@require_roles(ROLE_ADMIN) 
async def update_part(request: Request):
    # ✅ SỬA LỖI: Truyền vào BACKEND_URL
    return await proxy_request(request, BACKEND_URL)

@router.delete("/{part_id}")
@require_roles(ROLE_ADMIN) 
async def delete_part(request: Request):
    # ✅ SỬA LỖI: Truyền vào BACKEND_URL
    return await proxy_request(request, BACKEND_URL)