from fastapi import FastAPI, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from shared import db
from user_service import models, schemas
from user_service.middleware.auth_middleware import AuthMiddleware
from passlib.context import CryptContext

app = FastAPI(title="User Service")
app.add_middleware(AuthMiddleware)

def get_db():
    db_conn = db.SessionLocal()
    try:
        yield db_conn
    finally:
        db_conn.close()


def get_user_from_request(request: Request):
    if not getattr(request.state, "auth_header", None):
        raise HTTPException(status_code=401, detail="Unauthorized")
    # Giả sử Gateway đã kiểm tra token hợp lệ, ta có thể đọc payload nếu cần
    import jwt, os
    token = request.state.auth_header.split(" ")[1]
    payload = jwt.decode(token, os.getenv("JWT_SECRET", "super-secret-key"), algorithms=["HS256"])
    return payload

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

@app.get("/users")
def get_all_users(request: Request, db: Session = Depends(get_db)):
    user = get_user_from_request(request)
    if user["role"] != "Admin":
        raise HTTPException(status_code=403, detail="Only Admin can view all users")

    return db.query(models.User).all()

@app.post("/users")
def create_user(payload: schemas.UserCreate, request: Request, db: Session = Depends(get_db)):
    user_payload = get_user_from_request(request)

    # Chỉ Admin được phép tạo user mới
    if user_payload["role"] != "Admin":
        raise HTTPException(status_code=403, detail="Only Admin can create users")

    # Kiểm tra username trùng
    if db.query(models.User).filter_by(username=payload.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")

    # Kiểm tra role tồn tại
    role = db.query(models.Role).filter_by(role_id=payload.role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    # Tạo user
    hashed_password = hash_password(payload.password)
    new_user = models.User(
        username=payload.username,
        password_hash=hashed_password,  # cần hash trước ở frontend hoặc gửi hash qua auth_service
        email=payload.email,
        full_name=payload.full_name,
        phone=payload.phone,
        gender=payload.gender,
        role_id=payload.role_id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    new_profile = models.UserProfile(
        user_id=new_user.user_id,
        username=new_user.username,
        full_name=new_user.full_name,
        phone=None,
        address=None,
        gender=None,
        position=role.role_name,
        is_active=True
    )
    db.add(new_profile)
    db.commit()

    return {"message": f"User '{new_user.username}' created successfully", "user_id": new_user.user_id}


@app.get("/users/{user_id}")
def get_user(user_id: int, request: Request, db: Session = Depends(get_db)):
    user_payload = get_user_from_request(request)
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # user chỉ được xem chính mình
    if user_payload["role"] != "Admin" and user.username != user_payload["sub"]:
        raise HTTPException(status_code=403, detail="Access denied")

    return user

@app.put("/users/{user_id}")
def update_user(user_id: int, payload: schemas.UserUpdate, request: Request, db: Session = Depends(get_db)):
    user_payload = get_user_from_request(request)
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Admin có thể sửa bất kỳ ai, user chỉ được sửa chính mình
    if user_payload["role"] != "Admin" and user.username != user_payload["sub"]:
        raise HTTPException(status_code=403, detail="Access denied")

    if payload.username:
        user.username = payload.username
    if payload.email:
        user.email = payload.email
    if payload.role_id and user_payload["role"] == "Admin":  # chỉ admin được đổi role
        user.role_id = payload.role_id

    db.commit()
    db.refresh(user)
    return {"message": "User updated successfully", "user": user}

@app.delete("/users/{user_id}")
def delete_user(user_id: int, request: Request, db: Session = Depends(get_db)):
    user_payload = get_user_from_request(request)
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user_payload["role"] != "Admin" and user.username != user_payload["sub"]:
        raise HTTPException(status_code=403, detail="Access denied")

    db.delete(user)
    db.commit()
    return {"message": f"User {user.username} deleted successfully"}

@app.post("/users/profiles")
def create_profile(payload: schemas.UserProfileCreate, db: Session = Depends(get_db)):
    existing = db.query(models.UserProfile).filter_by(user_id=payload.user_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists for this user")

    new_profile = models.UserProfile(**payload.dict())
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    return {"message": "Profile created successfully", "profile": new_profile}

@app.get("/users/profiles/{user_id}")
def get_profile(user_id: int, request: Request, db: Session = Depends(get_db)):
    user_payload = get_user_from_request(request)
    profile = db.query(models.UserProfile).filter_by(user_id=user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # chỉ admin hoặc chính chủ mới được xem
    if user_payload["role"] != "Admin" and user_payload["sub"] != profile.user.username:
        raise HTTPException(status_code=403, detail="Access denied")

    return profile


@app.put("/users/profiles/{user_id}")
def update_profile(user_id: int, payload: schemas.UserProfileBase, request: Request, db: Session = Depends(get_db)):
    user_payload = get_user_from_request(request)
    profile = db.query(models.UserProfile).filter_by(user_id=user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # chỉ admin hoặc chính chủ được chỉnh sửa
    if user_payload["role"] != "Admin" and user_payload["sub"] != profile.user.username:
        raise HTTPException(status_code=403, detail="Access denied")

    for field, value in payload.dict(exclude_unset=True).items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return {"message": "Profile updated successfully", "profile": profile}