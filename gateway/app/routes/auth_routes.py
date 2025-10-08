from fastapi import APIRouter, Request
from pydantic import BaseModel
from app.core.config import AUTH_SERVICE_URL
from app.utils.proxy import forward_request
from app.middleware.role_guard import require_roles


router = APIRouter()

class LoginSchema(BaseModel):
    username: str
    password: str

@router.post("/login", include_in_schema=True)
async def login_proxy(request: Request, body: LoginSchema):
    """
    Forward login request with JSON body to Auth Service
    """
    upstream = f"{AUTH_SERVICE_URL}/login"
    return await forward_request(request, upstream, json_body=body.dict())

@router.post("/register")
async def register(request: Request):
    upstream = f"{AUTH_SERVICE_URL}/register"
    return await forward_request(request, upstream)

@router.get("/admin")
@require_roles("Admin", "EVM_Staff")
async def admin_panel(request: Request):
    return {"message": "Welcome Admin!"}

# === ROUTE WILDCARD (cho các endpoint khác nếu có) ===
@router.api_route("/{full_path:path}", methods=["GET","POST","PUT","PATCH","DELETE"])
async def proxy_auth(full_path: str, request: Request):
    upstream = f"{AUTH_SERVICE_URL}/{full_path}"
    return await forward_request(request, upstream)


