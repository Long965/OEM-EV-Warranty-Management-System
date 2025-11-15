from fastapi import APIRouter, Request
from app.core.proxy import proxy_request
import os

router = APIRouter()
BACKEND = os.getenv("BACKEND_URL", "http://backend:8100")

@router.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def parts_proxy(request: Request, path: str):
    return await proxy_request(request, BACKEND, f"/parts/{path}")
