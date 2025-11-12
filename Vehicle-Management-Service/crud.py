# Đây là file crud.py

from sqlalchemy.orm import Session
# Import các Model (từ models.py) và Schema (từ schemas.py)
import models  # <--- SỬA TỪ 'database' THÀNH 'models'
import schemas 

# --- CRUD cho Customer ---
def get_customer_by_phone(db: Session, phone: str):
    # Sửa database.Customer thành models.Customer
    return db.query(models.Customer).filter(models.Customer.phone_number == phone).first()

def create_customer(db: Session, customer: schemas.CustomerSchema):
    db_customer = models.Customer(**customer.dict())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

# --- CRUD cho Vehicle ---
def get_vehicle_by_vin(db: Session, vin: str):
    return db.query(models.Vehicle).filter(models.Vehicle.vin == vin).first()

def create_vehicle(db: Session, vehicle: schemas.VehicleSchema, customer_id: int):
    db_vehicle = models.Vehicle(**vehicle.dict(), customer_id=customer_id)
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle

# --- CRUD cho Component (Gắn phụ tùng) ---
def create_vehicle_component(db: Session, component: schemas.ComponentSchema, vehicle_id: int):
    db_component = models.VehicleComponent(**component.dict(), vehicle_id=vehicle_id)
    db.add(db_component)
    db.commit()
    db.refresh(db_component)
    return db_component

# --- CRUD cho Service History (Lưu lịch sử DV) ---
def create_service_history(db: Session, service_log: schemas.ServiceHistorySchema, vehicle_id: int):
    db_service_log = models.ServiceHistory(**service_log.dict(), vehicle_id=vehicle_id)
    db.add(db_service_log)
    db.commit()
    db.refresh(db_service_log)
    return db_service_log

def get_service_history_by_vehicle_id(db: Session, vehicle_id: int):
    # Dùng relationship (mối quan hệ) đã định nghĩa trong models.py
    return db.query(models.ServiceHistory).filter(models.ServiceHistory.vehicle_id == vehicle_id).all()


# --- CRUD cho User (nếu cần) ---
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.users_id == user_id).first()