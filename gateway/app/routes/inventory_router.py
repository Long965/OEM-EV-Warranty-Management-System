# gateway/app/routes/inventory_router.py
from fastapi import APIRouter, Request
from app.utils.proxy import proxy_request
import os

# Import decorator phân quyền
from app.middleware.role_guard import require_roles

BASE_URL_BACKEND = os.environ.get("BACKEND_URL", "http://backend:8100") 

router = APIRouter(
    tags=["Inventory (Admin Only)"] 
)

@router.get("/")
@require_roles("admin") # <-- BẢO VỆ
async def list_inventory(request: Request):
    return await proxy_request(request, BASE_URL_BACKEND)

@router.post("/")
@require_roles("admin") # <-- BẢO VỆ
async def create_inventory_item(request: Request):
    return await proxy_request(request, BASE_URL_BACKEND)

@router.get("/{inventory_id}") 
@require_roles("admin") # <-- BẢO VỆ
async def get_inventory_item(request: Request):
    return await proxy_request(request, BASE_URL_BACKEND)

@router.put("/{inventory_id}") 
@require_roles("admin") # <-- BẢO VỆ
async def update_inventory_item(request: Request):
    return await proxy_request(request, BASE_URL_BACKEND)

@router.delete("/{inventory_id}") 
@require_roles("admin") # <-- BẢO VỆ
async def delete_inventory_item(request: Request):
    return await proxy_request(request, BASE_URL_BACKEND)