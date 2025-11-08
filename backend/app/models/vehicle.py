# app/models/vehicle.py
from sqlalchemy import Column, String, Integer
from app.core.database import Base

class Vehicle(Base):
    __tablename__ = "vehicles"

    vin = Column(String(64), primary_key=True, index=True)
    model = Column(String(100))
    owner = Column(String(120))
