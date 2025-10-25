from pydantic import BaseModel
from typing import Optional

class UserProfileOut(BaseModel):
    user_id: int
    full_name: Optional[str]
    phone: Optional[str]
    address: Optional[str]
    department: Optional[str]
    position: Optional[str]
    is_active: bool

    class Config:
        orm_mode = True
