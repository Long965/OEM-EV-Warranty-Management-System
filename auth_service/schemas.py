from pydantic import BaseModel, EmailStr
from typing import Optional

class RegisterIn(BaseModel):
    username: str
    password: str
    email: Optional[EmailStr] = None
    role_name: str

class LoginIn(BaseModel):
    username: str
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
