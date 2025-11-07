# replace function signatures to use `session` not `db`
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
import db, models, schemas, utils, jwt_handler
import requests, os

USER_SERVICE_URL = os.getenv("USER_SERVICE_URL", "http://user_service:8002")
app = FastAPI(title="Auth Service")

@app.post("/register")
def register(payload: schemas.RegisterIn, session: Session = Depends(db.get_db)):
    # replace all occurrences of db.query(...) by session.query(...)
    allowed_roles = ["SC_Staff", "SC_Technician", "EVM_Staff"]

    if payload.role_name == "Admin":
        raise HTTPException(status_code=403, detail="Cannot register as Admin")

    if payload.role_name not in allowed_roles:
        raise HTTPException(status_code=400, detail="Invalid role")

    role = session.query(models.Role).filter_by(role_name=payload.role_name).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    if session.query(models.User).filter_by(username=payload.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")

    new_user = models.User(
        username=payload.username,
        password_hash=utils.hash_password(payload.password),
        email=payload.email,
        role_id=role.role_id
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    # If profile present, forward to user_service (best-effort)
    if getattr(payload, "profile", None):
        try:
            requests.post(f"{USER_SERVICE_URL}/profiles", json={
                "user_id": new_user.user_id,
                **payload.profile
            }, timeout=5)
        except Exception as e:
            # log but don't fail registration
            print("⚠️ Could not create profile:", e)

    return {"message": f"User '{payload.username}' registered successfully"}


@app.post("/login", response_model=schemas.TokenOut)
def login(payload: schemas.LoginIn, session: Session = Depends(db.get_db)):
    user = session.query(models.User).filter_by(username=payload.username).first()
    if not user or not utils.verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = jwt_handler.create_access_token({"sub": user.username, "role": user.role.role_name})
    return {"access_token": token, "token_type": "bearer"}
