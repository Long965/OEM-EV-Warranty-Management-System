from fastapi import FastAPI, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from shared import db
from user_service import models, schemas
from user_service.middleware.auth_middleware import AuthMiddleware
from passlib.context import CryptContext
import jwt, os
import sys


project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
if project_root not in sys.path:
    sys.path.append(project_root)

try:
    from auth_service.models import Token 
    TOKEN_MODEL_AVAILABLE = True
    print("SUCCESS: Token model imported successfully.")
except Exception as e:
    class Token: pass
    TOKEN_MODEL_AVAILABLE = False
    print(f"FATAL WARNING: Token model NOT found. Deletion skipped. Error: {e}")

from user_service.models import UserProfile 


app = FastAPI(title="User Service")
app.add_middleware(AuthMiddleware)

def get_db():
    db_conn = db.SessionLocal()
    try:
        yield db_conn
    finally:
        db_conn.close()


def get_user_from_request(request: Request):
    auth_header = getattr(request.state, "auth_header", None)
    
    if not auth_header:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authorization header missing or not set by middleware")
    
    try:
        scheme, token = auth_header.split(" ", 1)
        
        if scheme.lower() != "bearer" or not token:
            raise ValueError("Invalid authentication scheme or missing token part.")

    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token format. Expected 'Bearer <token>'."
        )

    try:
        payload = jwt.decode(token, os.getenv("JWT_SECRET", "super-secret-key"), algorithms=["HS256"])
        return payload
    except jwt.exceptions.DecodeError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {e}"
        )


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

    if user_payload["role"] != "Admin":
        raise HTTPException(status_code=403, detail="Only Admin can create users")

    if db.query(models.User).filter_by(username=payload.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")

    role = db.query(models.Role).filter_by(role_id=payload.role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    hashed_password = hash_password(payload.password)
    new_user = models.User(
        username=payload.username,
        password_hash=hashed_password,
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

    if user_payload["role"] != "Admin" and user.username != user_payload["sub"]:
        raise HTTPException(status_code=403, detail="Access denied")

    return user

@app.put("/users/{user_id}")
def update_user(user_id: int, payload: schemas.UserUpdate, request: Request, db: Session = Depends(get_db)):
    user_payload = get_user_from_request(request)
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user_payload["role"] != "Admin" and user.username != user_payload["sub"]:
        raise HTTPException(status_code=403, detail="Access denied")

    if payload.username:
        user.username = payload.username
    if payload.email:
        user.email = payload.email
    if payload.role_id and user_payload["role"] == "Admin":
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


    if TOKEN_MODEL_AVAILABLE:
        deleted_tokens = db.query(Token).filter(Token.user_id == user_id).delete(synchronize_session=False)
        print(f"Tokens deleted: {deleted_tokens}")

    else:
        print("WARNING: Skipped deleting Tokens due to model import failure. IntegrityError likely.")
    deleted_profiles = db.query(UserProfile).filter(UserProfile.user_id == user_id).delete(synchronize_session=False)
    print(f"User Profiles deleted: {deleted_profiles}")
    
    db.commit()
    
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

    if user_payload["role"] != "Admin" and user_payload["sub"] != profile.user.username:
        raise HTTPException(status_code=403, detail="Access denied")

    return profile


@app.put("/users/profiles/{user_id}")
def update_profile(user_id: int, payload: schemas.UserProfileBase, request: Request, db: Session = Depends(get_db)):
    user_payload = get_user_from_request(request)
    profile = db.query(models.UserProfile).filter_by(user_id=user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    if user_payload["role"] != "Admin" and user_payload["sub"] != profile.user.username:
        raise HTTPException(status_code=403, detail="Access denied")

    for field, value in payload.dict(exclude_unset=True).items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return {"message": "Profile updated successfully", "profile": profile}