# auth_service/models.py
from sqlalchemy import Column, Integer, String, Text, DATETIME, ForeignKey, BOOLEAN
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func # Để dùng CURRENT_TIMESTAMP

# Import Base từ file shared/db.py
from shared.db import Base 

class Role(Base):
    __tablename__ = "roles"
    role_id = Column(Integer, primary_key=True, autoincrement=True)
    role_name = Column(String(50), unique=True, nullable=False)
    description = Column(Text)
    
    # ✅ QUAN HỆ: Một Role có nhiều User
    users = relationship("User", back_populates="role")

class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    email = Column(String(100), unique=True) # Email nên là unique
    role_id = Column(Integer, ForeignKey("roles.role_id"), nullable=False)
    created_at = Column(DATETIME, default=func.now())
    
    # ✅ QUAN HỆ: Một User thuộc về một Role
    # Giúp Pydantic tự động đọc user.role.role_name
    role = relationship("Role", back_populates="users")

    # (Bạn có thể thêm các model khác như UserProfile, Token... ở đây)