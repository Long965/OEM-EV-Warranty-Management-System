# gateway/app/routes/parts_router.py
from fastapi import APIRouter, Request
from app.utils.proxy import proxy_request # (Hàm proxy của bạn)
import os

# Import decorator phân quyền
from app.middleware.role_guard import require_roles

BASE_URL_BACKEND = os.environ.get("BACKEND_URL", "http://backend:8100")

# Không có prefix ở đây, vì đã định nghĩa trong main.py
router = APIRouter(
    tags=["Parts (Admin Only)"]
)

@router.get("/")
@require_roles("admin") # <-- BẢO VỆ
async def list_parts(request: Request):
    return await proxy_request(request, BASE_URL_BACKEND)

@router.post("/")
@require_roles("admin") # <-- BẢO VỆ
async def create_part(request: Request):
    return await proxy_request(request, BASE_URL_BACKEND)

@router.get("/{part_id}")
@require_roles("admin") # <-- BẢO VỆ
async def get_part(request: Request):
    return await proxy_request(request, BASE_URL_BACKEND)

@router.put("/{part_id}")
@require_roles("admin") # <-- BẢO VỆ
async def update_part(request: Request):
    return await proxy_request(request, BASE_URL_BACKEND)

@router.delete("/{part_id}")
@require_roles("admin") # <-- BẢO VỆ
async def delete_part(request: Request):
    return await proxy_request(request, BASE_URL_BACKEND)