# shared/db.py
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import os

DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:long12345@mysql:3306/ev_warranty_db")

# Tạo engine (pool_pre_ping để tránh lỗi connection stale)
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# Tạo session factory
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

# Base class cho ORM model
Base = declarative_base()

# Dependency cho FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
