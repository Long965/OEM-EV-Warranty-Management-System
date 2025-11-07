from pydantic import BaseModel
from typing import Optional

class UserBase(BaseModel):
    username: str
    email: Optional[str]
    role_id: int

class UserCreate(UserBase):
    password_hash: str

class UserUpdate(BaseModel):
    username: Optional[str]
    email: Optional[str]
    role_id: Optional[int]

class UserProfileBase(BaseModel):
    full_name: Optional[str]
    phone: Optional[str]
    address: Optional[str]
    department: Optional[str]
    position: Optional[str]
    is_active: Optional[bool] = True

class UserProfileCreate(UserProfileBase):
    user_id: int  # cần từ auth_service gửi sang

class UserProfileOut(UserProfileBase):
    profile_id: int
    user_id: int

    class Config:
        orm_mode = True
