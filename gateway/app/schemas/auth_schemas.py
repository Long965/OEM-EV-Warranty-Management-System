# gateway/app/schemas/auth_schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional

# (Đây là bản sao của các model trong auth_service)

class RegisterIn(BaseModel):
    username: str
    password: str
    email: Optional[EmailStr] = None
    role_name: str

class LoginIn(BaseModel):
    username: str
    password: str