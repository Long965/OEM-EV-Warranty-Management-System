# File: gateway/app/routes/suppliers_router.py

import os
from fastapi import APIRouter, Request
from app.middleware.role_guard import require_roles
from app.utils.proxy import proxy_request 

router = APIRouter(
    tags=["Suppliers (Admin Only)"] 
)

# ✅ SỬA LỖI: Lấy BACKEND_URL từ biến môi trường
BACKEND_URL = os.getenv("BACKEND_URL")
ROLE_ADMIN = "Admin" 

@router.get("/")
@require_roles(ROLE_ADMIN) 
async def list_suppliers(request: Request):
    # ✅ SỬA LỖI: Truyền vào BACKEND_URL
    return await proxy_request(request, BACKEND_URL)

@router.post("/")
@require_roles(ROLE_ADMIN) 
async def create_supplier(request: Request):
    # ✅ SỬA LỖI: Truyền vào BACKEND_URL
    return await proxy_request(request, BACKEND_URL)

@router.get("/{supplier_id}")
@require_roles(ROLE_ADMIN) 
async def get_supplier(request: Request):
    # ✅ SỬA LỖI: Truyền vào BACKEND_URL
    return await proxy_request(request, BACKEND_URL)

@router.put("/{supplier_id}")
@require_roles(ROLE_ADMIN) 
async def update_supplier(request: Request):
    # ✅ SỬA LỖI: Truyền vào BACKEND_URL
    return await proxy_request(request, BACKEND_URL)

@router.delete("/{supplier_id}")
@require_roles(ROLE_ADMIN) 
async def delete_supplier(request: Request):
    # ✅ SỬA LỖI: Truyền vào BACKEND_URL
    return await proxy_request(request, BACKEND_URL)