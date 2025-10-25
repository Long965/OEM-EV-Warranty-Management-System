from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, func
from db import Base

class UserProfile(Base):
    __tablename__ = "user_profiles"

    profile_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, unique=True, nullable=False)
    full_name = Column(String(100))
    phone = Column(String(20))
    address = Column(String(255))
    department = Column(String(100))
    position = Column(String(100))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
