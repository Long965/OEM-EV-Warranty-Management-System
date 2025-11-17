# auth_service/main.py

from fastapi import FastAPI, Depends, HTTPException, APIRouter # <-- 1. Thêm APIRouter
from sqlalchemy.orm import Session
from starlette.status import HTTP_401_UNAUTHORIZED

# ✅ SỬA LỖI IMPORT: Dùng import trực tiếp
import models
import schemas
import utils
import jwt_handler
from shared import db 

app = FastAPI(title="Auth Service")

# --- 2. Tạo một Router mới ---
router = APIRouter()

@app.get("/")
def root():
    return {"status": "Auth Service is running"}

# --- API Đăng Ký (Register) ---
# 3. Thay đổi @app.post thành @router.post
@router.post("/register", response_model=schemas.UserOut) 
def create_user(user_in: schemas.RegisterIn, db_session: Session = Depends(db.get_db)):
    db_user_email = utils.get_user_by_email(db_session, email=user_in.email)
    if db_user_email:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    db_user_name = utils.get_user_by_username(db_session, username=user_in.username)
    if db_user_name:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    return utils.create_user(db_session=db_session, user=user_in)

# --- API Đăng Nhập (Login) ---
# 4. Thay đổi @app.post thành @router.post
@router.post("/login", response_model=schemas.TokenOut)
def login_for_access_token(
    login_data: schemas.LoginIn,
    db_session: Session = Depends(db.get_db)
):
    user = utils.authenticate_user(
        db_session, 
        username=login_data.username,
        password=login_data.password
    )
    
    if not user:
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = jwt_handler.create_access_token(
        data={"sub": user.email, "role": user.role.role_name} 
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

# --- 5. Thêm Router vào App với Prefix ---
# ✅ SỬA LỖI 404: Thêm prefix="/auth"
app.include_router(router, prefix="/auth")