from fastapi import FastAPI, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from user_service import db, models, schemas
from user_service.middleware.auth_middleware import AuthMiddleware


app = FastAPI(title="User Service")
app.add_middleware(AuthMiddleware)

def get_db():
    db_conn = db.SessionLocal()
    try:
        yield db_conn
    finally:
        db_conn.close()


def get_user_from_request(request: Request):
    if not request.state.user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return request.state.user


@app.get("/users")
def get_all_users(request: Request, db: Session = Depends(get_db)):
    user = get_user_from_request(request)
    if user["role"] != "Admin":
        raise HTTPException(status_code=403, detail="Only Admin can view all users")

    return db.query(models.User).all()


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
