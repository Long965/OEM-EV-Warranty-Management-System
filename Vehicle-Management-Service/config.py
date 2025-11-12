# Đây là file config.py

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # 1. Sửa 'localhost' thành 'db' (tên service trong docker-compose.yml)
    # 2. Đảm bảo user ('postgres'), pass ('Duy2004'), 
    #    và db_name ('warranty_db') là đúng
    DATABASE_URL: str = "postgresql://postgres:Duy2004@db:5432/warranty_db"

    class Config:
        env_file = ".env" # Cho phép đọc từ file .env (nâng cao)

# Tạo một đối tượng 'settings' để các file khác (như database.py) import
settings = Settings()