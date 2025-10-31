# app/main.py
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from db import Base, engine, get_db
from sqlalchemy import text

app = FastAPI(title="Warehouse Management API")

# Tự động tạo bảng (nếu ORM models được định nghĩa)
Base.metadata.create_all(bind=engine)


@app.get("/")
def read_root():
    return {"message": "🚀 Warehouse Management API is running!"}


@app.get("/check-db")
def check_db_connection(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "✅ Database connection successful!"}
    except Exception as e:
        return {"status": "❌ Database connection failed", "error": str(e)}
