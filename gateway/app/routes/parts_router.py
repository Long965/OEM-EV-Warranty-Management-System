# gateway/app/routes/parts_router.py

from fastapi import APIRouter, Request
from starlette.responses import Response
import os
from app.utils.proxy import proxy_request # Đảm bảo import đúng

BASE_URL_BACKEND = os.environ.get("BACKEND_URL", "http://backend:8100") 

# ❌ XÓA PREFIX Ở ĐÂY
# router = APIRouter(prefix="/parts", tags=["Parts Supply"])

# ✅ SỬA THÀNH:
router = APIRouter(
    tags=["Parts Supply"] 
    # Tiền tố (prefix) đã được định nghĩa trong main.py
)

# 1. LIST PARTS
# Sẽ xử lý: GET /parts/
@router.get("/") 
async def list_parts(request: Request):
    return await proxy_request(request, BASE_URL_BACKEND)

# 2. CREATE PART
# Sẽ xử lý: POST /parts/
@router.post("/")
async def create_part(request: Request):
    return await proxy_request(request, BASE_URL_BACKEND)

# 3. GET PART BY ID
# Sẽ xử lý: GET /parts/{part_id}
@router.get("/{part_id}") 
async def get_part(request: Request):
    return await proxy_request(request, BASE_URL_BACKEND)

# 4. UPDATE PART
# Sẽ xử lý: PUT /parts/{part_id}
@router.put("/{part_id}") 
async def update_part(request: Request):
    return await proxy_request(request, BASE_URL_BACKEND)

# 5. DELETE PART
# Sẽ xử lý: DELETE /parts/{part_id}
@router.delete("/{part_id}") 
async def delete_part(request: Request):
    return await proxy_request(request, BASE_URL_BACKEND)