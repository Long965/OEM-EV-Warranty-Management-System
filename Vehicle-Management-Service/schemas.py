from pydantic import BaseModel
from typing import Optional, List
from datetime import date # Sửa lại từ Date của typing

# Schema dùng để đọc (trả về cho user)
class CustomerSchema(BaseModel):
    full_name: str
    phone_number: str
    address: Optional[str] = None
    
    class Config:
        from_attributes = True # Đã sửa 'orm_mode' thành 'from_attributes'

class VehicleSchema(BaseModel):
    vin: str
    make: str
    model: str
    year: int
    color: str
    
    class Config:
        from_attributes = True # Đã sửa

# Schema cho form Đăng Ký (kết hợp cả 2)
class RegistrationForm(BaseModel):
    vehicle: VehicleSchema
    customer: CustomerSchema

# Schema cho "Gắn phụ tùng"
class ComponentSchema(BaseModel):
    part_type: str
    serial_number: str
    installed_at: date
    
    class Config:
        from_attributes = True # Đã sửa

# Schema cho "Lưu lịch sử dịch vụ"
class ServiceHistorySchema(BaseModel):
    service_date: date
    description: str
    technician_id: int 
    
    class Config:
        from_attributes = True