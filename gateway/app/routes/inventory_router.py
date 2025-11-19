import os
from fastapi import APIRouter, Request
from app.middleware.role_guard import require_roles
# Lưu ý: Đảm bảo bạn import đúng tên file proxy bạn đang có (proxy hoặc part_proxy)
from app.utils.part_proxy import proxy_request 

router = APIRouter( 
    tags=["Inventory (Admin Only)"]
)

# Backend chạy port 8100
BACKEND_URL = os.getenv("INVENTORY_SERVICE_URL", "http://oem_ev_warranty_backend:8100")
ROLE_ADMIN = "Admin" 

# 1. Lấy danh sách
@router.get("/")
@require_roles(ROLE_ADMIN) 
async def list_inventory(request: Request):
    return await proxy_request(request, BACKEND_URL)

# 2. Tạo mới
@router.post("/")
@require_roles(ROLE_ADMIN) 
async def create_inventory(request: Request):
    return await proxy_request(request, BACKEND_URL)

# 3. Lấy chi tiết
@router.get("/{id}")
@require_roles(ROLE_ADMIN) 
async def get_inventory_item(request: Request):
    return await proxy_request(request, BACKEND_URL)

# 4. Cập nhật
@router.put("/{id}")
@require_roles(ROLE_ADMIN) 
async def update_inventory(request: Request):
    return await proxy_request(request, BACKEND_URL)

# 5. Xóa
@router.delete("/{id}")
@require_roles(ROLE_ADMIN) 
async def delete_inventory(request: Request):
    return await proxy_request(request, BACKEND_URL)