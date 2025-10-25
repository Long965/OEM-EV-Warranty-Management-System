from fastapi import APIRouter, Request
from app.utils.proxy import forward_request
from app.core.config import AUTH_SERVICE_URL

router = APIRouter()

@router.post("/login")
async def login_proxy(request: Request):
    return await forward_request(request, f"{AUTH_SERVICE_URL}/login")

@router.post("/register")
async def register_proxy(request: Request):
    return await forward_request(request, f"{AUTH_SERVICE_URL}/register")
