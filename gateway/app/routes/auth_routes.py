from fastapi import APIRouter, Body
from app.utils.proxy import forward_request
from app.core.config import AUTH_SERVICE_URL

router = APIRouter()

@router.post("/login")
async def login_proxy(payload: dict = Body(..., example={
    "username": "john_doe",
    "password": "123456"
})):
    """Forward login request to Auth Service"""
    return await forward_request(payload, f"{AUTH_SERVICE_URL}/login")


@router.post("/register")
async def register_proxy(payload: dict = Body(..., example={
    "username": "john_doe",
    "password": "123456",
    "email": "john@example.com",
    "role_name": "EVM_Staff",
    "profile": {
        "full_name": "John Doe",
        "phone": "0987654321",
        "address": "123 EV Street",
        "department": "Warranty Support",
        "position": "Technician"
    }
})):
    """Forward register request to Auth Service"""
    return await forward_request(payload, f"{AUTH_SERVICE_URL}/register")
