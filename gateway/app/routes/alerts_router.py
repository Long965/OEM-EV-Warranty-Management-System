import os
from fastapi import APIRouter, Request
from app.middleware.role_guard import require_roles
from app.utils.part_proxy import proxy_request 

router = APIRouter( 
    tags=["Alerts (Admin Only)"]
)

BACKEND_URL = os.getenv("ALERTS_SERVICE_URL", "http://oem_ev_warranty_backend:8100")
ROLE_ADMIN = "Admin" 

@router.get("/")
@require_roles(ROLE_ADMIN) 
async def list_alerts(request: Request):
    return await proxy_request(request, BACKEND_URL)

@router.post("/")
@require_roles(ROLE_ADMIN) 
async def create_alert(request: Request):
    return await proxy_request(request, BACKEND_URL)

@router.get("/{id}")
@require_roles(ROLE_ADMIN) 
async def get_alert(request: Request):
    return await proxy_request(request, BACKEND_URL)

@router.put("/{id}")
@require_roles(ROLE_ADMIN) 
async def update_alert(request: Request):
    return await proxy_request(request, BACKEND_URL)

@router.delete("/{id}")
@require_roles(ROLE_ADMIN) 
async def delete_alert(request: Request):
    return await proxy_request(request, BACKEND_URL)