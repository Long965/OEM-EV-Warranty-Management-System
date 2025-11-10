from pydantic import BaseModel, EmailStr
from typing import Optional

class RegisterIn(BaseModel):
    username: str
    password: str
    email: Optional[EmailStr] = None
    role_name: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[str] = None

class LoginIn(BaseModel):
    username: str
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: Optional[int] = None
    role: Optional[str] = None
    expires_in: Optional[str] = None
