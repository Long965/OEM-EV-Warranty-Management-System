from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from shared.db import Base

class Token(Base):

    __tablename__ = "tokens"

    token_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    access_token = Column(Text, nullable=False)
    issued_at = Column(DateTime, default=datetime.now(timezone.utc))
    expires_at = Column(DateTime)

    user = relationship("User", back_populates="tokens")

class Role(Base):

    __tablename__ = "roles"

    role_id = Column(Integer, primary_key=True, autoincrement=True)
    role_name = Column(String(50), unique=True, nullable=False)
    description = Column(Text)
    # One role -> many users
    users = relationship("User", back_populates="role")


class User(Base):

    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    
    full_name = Column(String(100))
    phone = Column(String(20))
    gender = Column(String(10))
    email = Column(String(100))

    role_id = Column(Integer, ForeignKey("roles.role_id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    role = relationship("Role", back_populates="users")
    tokens = relationship("Token", back_populates="user", cascade="all, delete-orphan")