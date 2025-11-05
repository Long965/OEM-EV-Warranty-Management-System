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
