from fastapi import FastAPI, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from shared import db
from auth_service import models, schemas, utils, jwt_handler
from datetime import datetime, timedelta, timezone
import os
import requests

USER_SERVICE_URL = os.getenv("USER_SERVICE_URL", "http://user_service:8002")

app = FastAPI(title="Auth Service")


#REGISTER
@app.post("/register")
def register(payload: schemas.RegisterIn, session: Session = Depends(db.get_db)):
    allowed_roles = ["SC_Staff", "SC_Technician", "EVM_Staff"]

    #Không cho tự đăng ký Admin
    if payload.role_name == "Admin":
        raise HTTPException(status_code=403, detail="Cannot register as Admin")

    if payload.role_name not in allowed_roles:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    # Kiểm tra role tồn tại
    role = session.query(models.Role).filter_by(role_name=payload.role_name).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    # Kiểm tra username trùng
    if session.query(models.User).filter_by(username=payload.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")

    # Tạo user with additional fields
    new_user = models.User(
        username=payload.username,
        password_hash=utils.hash_password(payload.password),
        email=payload.email,
        role_id=role.role_id,
        full_name=payload.full_name,
        phone=payload.phone,
        gender=payload.gender
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    # Gửi request tạo profile sang user_service
    profile_payload = {
        "user_id": new_user.user_id,
        "username": new_user.username,
        "full_name": new_user.full_name,
        "phone": new_user.phone,
        "gender": new_user.gender,
        "position": role.role_name,
        "is_active": True
    }
    try:
        headers = {"Content-Type": "application/json"}
        requests.post(
            f"{USER_SERVICE_URL}/profiles",
            json=profile_payload,
            headers=headers,
            timeout=5
        )
    except Exception as e:
        # log nhưng không rollback user (tùy business decision)
        print(f"Could not create profile for user_id={new_user.user_id}: {e}")

    return {"message": f"User '{payload.username}' registered successfully", "user_id": new_user.user_id}


# LOGIN
@app.post("/login", response_model=schemas.TokenOut)
def login(payload: schemas.LoginIn, session: Session = Depends(db.get_db)):
    user = session.query(models.User).filter_by(username=payload.username).first()
    if not user or not utils.verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Tạo JWT token
    token = jwt_handler.create_access_token({
        "sub": user.username,
        "role": user.role.role_name
    })

    # Lưu token vào DB
    expires_at = datetime.now(timezone.utc) + timedelta(hours=int(os.getenv("ACCESS_TOKEN_HOURS", 8)))
    new_token = models.Token(
        user_id=user.user_id,
        access_token=token,
        issued_at=datetime.now(timezone.utc),
        expires_at=expires_at
    )
    session.add(new_token)
    session.commit()

    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.user_id,
        "role": user.role.role_name,
        "expires_in": f"{int(os.getenv('ACCESS_TOKEN_HOURS', 8))}h"
    }

# Logout
@app.post("/logout")
def logout(request: Request, session: Session = Depends(db.get_db)):
    auth = request.headers.get("Authorization")
    if not auth:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    token = auth.split(" ")[1]
    session.query(models.Token).filter_by(access_token=token).delete()
    session.commit()
    return {"message": "Logged out successfully"}
