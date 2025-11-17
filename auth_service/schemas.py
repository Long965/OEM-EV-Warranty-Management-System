# auth_service/schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional

# --- Model cho Input (Đầu vào) ---

class RegisterIn(BaseModel):
    username: str
    password: str
    email: Optional[EmailStr] = None
    role_name: str

class LoginIn(BaseModel):
    username: str
    password: str

# --- Model cho Output (Đầu ra) ---

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

# ✅ BỔ SUNG Model này:
# Model con để chỉ lấy 'role_name' từ relationship
class RoleOut(BaseModel):
    role_name: str
    
    class Config:
        from_attributes = True

# ✅ SỬA LẠI Model này:
class UserOut(BaseModel):
    """
    Model Pydantic dùng để TRẢ VỀ thông tin user (Output).
    Đã sửa để khớp với models.py
    """
    user_id: int # <-- SỬA LẠI: từ 'id' thành 'user_id'
    username: str
    email: Optional[EmailStr] = None
    
    # SỬA LẠI: Thay vì 'role_name: str',
    # chúng ta lấy cả object 'role' (thuộc kiểu RoleOut)
    role: RoleOut 
    
    class Config:
        # Giúp Pydantic đọc dữ liệu từ model SQLAlchemy
        from_attributes = True 
        # (Nếu dùng Pydantic v1, hãy dùng: orm_mode = True)