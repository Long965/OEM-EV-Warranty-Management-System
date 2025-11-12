from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config import settings # Import 'settings' từ config.py

# 1. Tạo Engine sử dụng DATABASE_URL từ config
engine = create_engine(settings.DATABASE_URL)

# 2. Tạo SessionLocal: Mọi tương tác DB sẽ qua đây
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Hàm Dependency để lấy DB Session (FastAPI best practice)
def get_db():
    db = SessionLocal()
    try:
        yield db  # Trả về session
    finally:
        db.close() # Đóng session khi hoàn thành