# gateway/app/routes/assignments_router.py
from fastapi import APIRouter, Request
from starlette.responses import Response
import os
from app.utils.proxy import proxy_request

# Import decorator phân quyền
from app.middleware.role_guard import require_roles

BASE_URL_BACKEND = os.environ.get("BACKEND_URL", "http://backend:8100")

router = APIRouter(
    tags=["Assignments (Admin Only)"]
)

@router.get("/")
@require_roles("admin") # <-- BẢO VỆ
async def list_assignments(request: Request):
    return await proxy_request(request, BASE_URL_BACKEND)

@router.post("/")
@require_roles("admin") # <-- BẢO VỆ
async def create_assignment(request: Request):
    return await proxy_request(request, BASE_URL_BACKEND)

@router.get("/{assignment_id}")
@require_roles("admin") # <-- BẢO VỆ
async def get_assignment(request: Request):
    return await proxy_request(request, BASE_URL_BACKEND)

@router.put("/{assignment_id}")
@require_roles("admin") # <-- BẢO VỆ
async def update_assignment(request: Request):
    return await proxy_request(request, BASE_URL_BACKEND)

@router.delete("/{assignment_id}")
@require_roles("admin") # <-- BẢO VỆ
async def delete_assignment(request: Request):
    return await proxy_request(request, BASE_URL_BACKEND)