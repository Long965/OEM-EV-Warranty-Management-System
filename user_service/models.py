from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from shared.db import Base

class Role(Base):
    __tablename__ = "roles"
    role_id = Column(Integer, primary_key=True, autoincrement=True)
    role_name = Column(String(50), unique=True, nullable=False)
    description = Column(Text)

class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    email = Column(String(100))
    role_id = Column(Integer, ForeignKey("roles.role_id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    role = relationship("Role")
