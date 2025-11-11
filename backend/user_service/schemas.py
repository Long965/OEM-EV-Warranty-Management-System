from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: Optional[EmailStr] = None
    role_id: int
    full_name: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str]
    email: Optional[EmailStr]
    role_id: Optional[int]
    full_name: Optional[str]
    phone: Optional[str]
    gender: Optional[str]

class UserProfileBase(BaseModel):
    username: Optional[str] = None
    full_name: Optional[str] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    position: Optional[str] = None
    is_active: Optional[bool] = True

class UserProfileCreate(UserProfileBase):
    user_id: int  # cần từ auth_service gửi sang

class UserProfileOut(UserProfileBase):
    profile_id: int
    user_id: int
    created_at: datetime

    class Config:
        orm_mode = True