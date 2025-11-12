from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import contextlib # Import thư viện contextlib

# Import 4 file của chúng ta
import crud
import models
import schemas
from database import engine, SessionLocal 

# === SỬA LỖI QUAN TRỌNG NHẤT ===
# Chúng ta không tạo bảng ở đây nữa.
# Thay vào đó, chúng ta tạo một "event handler" (trình xử lý sự kiện)
@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    # Code này sẽ chạy KHI server BẮT ĐẦU
    print("Server đang khởi động...")
    print("Đang chạy create_all để tạo bảng (nếu chưa có)...")
    models.Base.metadata.create_all(bind=engine)
    print("Tạo bảng hoàn thành!")
    yield
    # Code dưới yield sẽ chạy KHI server TẮT (không cần)

# Gán lifespan event cho app
app = FastAPI(lifespan=lifespan)

# Hàm để lấy session (kết nối) tới database
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def read_root():
    return {"message": "Đây là Vehicle-Management-Service API ()"}


# --- API 1: ĐĂNG KÝ XE & KHÁCH HÀNG ---
# (Code API không thay đổi, chỉ copy/paste lại)
@app.post("/api/register", response_model=schemas.RegistrationForm)
def register_vehicle(form: schemas.RegistrationForm, db: Session = Depends(get_db)):
    
    db_customer = crud.get_customer_by_phone(db, phone=form.customer.phone_number)
    if not db_customer:
        db_customer = crud.create_customer(db, customer=form.customer)

    db_vehicle = crud.get_vehicle_by_vin(db, vin=form.vehicle.vin)
    if db_vehicle:
        raise HTTPException(status_code=400, detail="Lỗi: Số VIN này đã tồn tại")

    new_vehicle = crud.create_vehicle(db, vehicle=form.vehicle, customer_id=db_customer.customer_id)
    return {"vehicle": new_vehicle, "customer": db_customer}

# --- API 2: GẮN SỐ SERI PHỤ TÙNG ---
@app.post("/api/vehicles/{vin}/components", response_model=schemas.ComponentSchema)
def add_component_to_vehicle(vin: str, component: schemas.ComponentSchema, db: Session = Depends(get_db)):
    
    db_vehicle = crud.get_vehicle_by_vin(db, vin=vin)
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Lỗi: Không tìm thấy xe với số VIN này")
        
    return crud.create_vehicle_component(db, component=component, vehicle_id=db_vehicle.vehicle_id)

# --- API 3: LƯU LỊCH SỬ DỊCH VỤ ---
@app.post("/api/vehicles/{vin}/service-history", response_model=schemas.ServiceHistorySchema)
def add_service_history(vin: str, service_log: schemas.ServiceHistorySchema, db: Session = Depends(get_db)):
    
    db_vehicle = crud.get_vehicle_by_vin(db, vin=vin)
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Lỗi: Không tìm thấy xe với số VIN này")

    db_user = crud.get_user(db, user_id=service_log.technician_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="Lỗi: Không tìm thấy Kỹ thuật viên với ID này")

    return crud.create_service_history(db, service_log=service_log, vehicle_id=db_vehicle.vehicle_id)

# --- API 4: XEM LỊCH SỬ DỊCH VỤ ---
@app.get("/api/vehicles/{vin}/service-history", response_model=List[schemas.ServiceHistorySchema])
def get_service_history(vin: str, db: Session = Depends(get_db)):
    
    db_vehicle = crud.get_vehicle_by_vin(db, vin=vin)
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Lỗi: Không tìm thấy xe với số VIN này")
        
    return crud.get_service_history_by_vehicle_id(db, vehicle_id=db_vehicle.vehicle_id)