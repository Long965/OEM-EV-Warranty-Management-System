from sqlalchemy import create_engine, Column, Integer, String, Date, Text, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

# Base class để tất cả các model kế thừa
Base = declarative_base()

class Customer(Base):
    __tablename__ = 'customers'
    
    customer_id = Column(Integer, primary_key=True)
    full_name = Column(String(100), nullable=False)
    phone_number = Column(String(20), unique=True)
    address = Column(String(255))
    created_at = Column(Date)
    
    # Mối quan hệ: Một customer có nhiều vehicle
    vehicles = relationship("Vehicle", back_populates="customer")

class Vehicle(Base):
    __tablename__ = 'vehicles'
    
    vehicle_id = Column(Integer, primary_key=True)
    vin = Column(String(50), unique=True, nullable=False)
    make = Column(String(50))
    year = Column(Integer)
    color = Column(String(30))
    created_at = Column(Date)
    
    # Khóa ngoại
    customer_id = Column(Integer, ForeignKey('customers.customer_id'))
    
    # Mối quan hệ
    customer = relationship("Customer", back_populates="vehicles")
    components = relationship("VehicleComponent", back_populates="vehicle")
    service_history = relationship("ServiceHistory", back_populates="vehicle")

class VehicleComponent(Base):
    __tablename__ = 'vehicle_components'
    
    component_id = Column(Integer, primary_key=True)
    part_type = Column(String(100))
    serial_number = Column(String(100), nullable=False)
    installed_at = Column(Date)
    
    # Khóa ngoại
    vehicle_id = Column(Integer, ForeignKey('vehicles.vehicle_id'))
    
    # Mối quan hệ
    vehicle = relationship("Vehicle", back_populates="components")

class User(Base):
    __tablename__ = 'users'
    
    users_id = Column(Integer, primary_key=True)
    name = Column(String(100))
    emaill = Column(String(100), unique=True) # 'emaill' trong ERD
    role = Column(String(50))
    
    # Mối quan hệ: Một user (technician) có nhiều service_history
    service_logs = relationship("ServiceHistory", back_populates="technician")

class ServiceHistory(Base):
    __tablename__ = 'service_history'
    
    log_id = Column(Integer, primary_key=True)
    service_date = Column(Date)
    description = Column(Text)
    created_at = Column(Date)
    
    # Khóa ngoại
    vehicle_id = Column(Integer, ForeignKey('vehicles.vehicle_id'))
    technician_id = Column(Integer, ForeignKey('users.users_id'))
    
    # Mối quan hệ
    vehicle = relationship("Vehicle", back_populates="service_history")
    technician = relationship("User", back_populates="service_logs")