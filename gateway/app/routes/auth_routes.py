from fastapi import APIRouter, Request
from app.core.config import AUTH_SERVICE_URL
from app.utils.proxy import forward_request

router = APIRouter()

# === ROUTE CỤ THỂ ===
@router.post("/login")
async def login(request: Request):
    upstream = f"{AUTH_SERVICE_URL}/login"
    return await forward_request(request, upstream)

@router.post("/register")
async def register(request: Request):
    upstream = f"{AUTH_SERVICE_URL}/register"
    return await forward_request(request, upstream)

# === ROUTE WILDCARD (cho các endpoint khác nếu có) ===
@router.api_route("/{full_path:path}", methods=["GET","POST","PUT","PATCH","DELETE"])
async def proxy_auth(full_path: str, request: Request):
    upstream = f"{AUTH_SERVICE_URL}/{full_path}"
    return await forward_request(request, upstream)
