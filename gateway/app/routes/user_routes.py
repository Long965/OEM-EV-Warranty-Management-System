from fastapi import APIRouter, Request
from app.utils.proxy import forward_request
from app.core.config import USER_SERVICE_URL

router = APIRouter()

@router.get("/users")
async def get_all_users(request: Request):
    """Get all users"""
    return await forward_request(request, f"{USER_SERVICE_URL}/users")

@router.get("/users/{user_id}")
async def get_user(user_id: int, request: Request):
    """Get user by ID"""
    return await forward_request(request, f"{USER_SERVICE_URL}/users/{user_id}")

@router.post("/users")
async def create_user(request: Request):
    """Create new user"""
    return await forward_request(request, f"{USER_SERVICE_URL}/users")

@router.put("/users/{user_id}")
async def update_user(user_id: int, request: Request):
    """Update user info"""
    return await forward_request(request, f"{USER_SERVICE_URL}/users/{user_id}")

@router.delete("/users/{user_id}")
async def delete_user(user_id: int, request: Request):
    """Delete user by ID"""
    return await forward_request(request, f"{USER_SERVICE_URL}/users/{user_id}")
