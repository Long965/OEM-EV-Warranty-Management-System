# auth_service/utils.py

from sqlalchemy.orm import Session
from passlib.context import CryptContext
import models
import schemas # <-- Đảm bảo import schemas để nhận 'RegisterIn'

# 1. Cấu hình hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# --- Các hàm truy vấn User ---

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_role_by_name(db: Session, role_name: str):
    return db.query(models.Role).filter(models.Role.role_name == role_name).first()

# --- Hàm xác thực (cho Login) ---
def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username=username)
    if not user:
        return False
    if not verify_password(password, user.password_hash):
        return False
    return user

# --- Hàm tạo User (cho Register) ---

# ✅ SỬA LỖI Ở ĐÂY:
# Sửa tên các tham số thành 'db_session' và 'user' (kiểu RegisterIn)
def create_user(db_session: Session, user: schemas.RegisterIn):
    """
    Hàm này sửa lỗi TypeError.
    Nó xử lý việc hash mật khẩu và tìm role_id.
    """
    
    # 1. Tìm Role ID từ Role Name
    role = get_role_by_name(db_session, role_name=user.role_name)
    if not role:
        raise Exception(f"Role '{user.role_name}' not found in roles table.")

    # 2. Hash mật khẩu
    hashed_password = get_password_hash(user.password)
    
    # 3. Tạo model User của database
    db_user = models.User(
        username=user.username,
        email=user.email,
        password_hash=hashed_password,
        role_id=role.role_id  # <-- Sử dụng role_id (Integer)
    )
    
    db_session.add(db_user)
    db_session.commit()
    db_session.refresh(db_user)
    
    return db_user