from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from shared import db
from auth_service import models, schemas, utils, jwt_handler
from datetime import datetime, timedelta, timezone
import os
import requests

USER_SERVICE_URL = os.getenv("USER_SERVICE_URL", "http://user_service:8002")

app = FastAPI(title="Auth Service")


# 🟢 REGISTER
@app.post("/register")
def register(payload: schemas.RegisterIn, session: Session = Depends(db.get_db)):
    allowed_roles = ["SC_Staff", "SC_Technician", "EVM_Staff"]

    # ❌ Không cho tự đăng ký Admin
    if payload.role_name == "Admin":
        raise HTTPException(status_code=403, detail="Cannot register as Admin")

    if payload.role_name not in allowed_roles:
        raise HTTPException(status_code=400, detail="Invalid role")

    # 🔍 Kiểm tra role tồn tại
    role = session.query(models.Role).filter_by(role_name=payload.role_name).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    # 🔍 Kiểm tra username trùng
    if session.query(models.User).filter_by(username=payload.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")

    # ✅ Tạo user
    new_user = models.User(
        username=payload.username,
        password_hash=utils.hash_password(payload.password),
        email=payload.email,
        role_id=role.role_id
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    # 🔹 Gửi request tạo profile sang user_service
    try:
        requests.post(
            f"{USER_SERVICE_URL}/profiles",
            json={
                "user_id": new_user.user_id,
                "full_name": payload.username,  # tạm thời đặt full_name = username
                "is_active": True
            },
            timeout=5
        )
    except Exception as e:
        print(f"⚠️ Could not create profile for user_id={new_user.user_id}: {e}")

    return {"message": f"User '{payload.username}' registered successfully"}


# 🟢 LOGIN
@app.post("/login", response_model=schemas.TokenOut)
def login(payload: schemas.LoginIn, session: Session = Depends(db.get_db)):
    user = session.query(models.User).filter_by(username=payload.username).first()
    if not user or not utils.verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # ✅ Tạo JWT token
    token = jwt_handler.create_access_token({
        "sub": user.username,
        "role": user.role.role_name
    })

    # ✅ Lưu token vào DB
    new_token = models.Token(
        user_id=user.user_id,
        access_token=token,
        issued_at=datetime.now(timezone.utc),
        expires_at=datetime.now(timezone.utc) + timedelta(hours=1)
    )
    session.add(new_token)
    session.commit()

    return {"access_token": token, "token_type": "bearer"}
