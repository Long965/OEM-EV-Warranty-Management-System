# app/core/config.py
from dotenv import load_dotenv
import os

load_dotenv()

DB_URL = os.getenv("DB_URL", "mysql+pymysql://root:nhathao25@mysql-db:3306/warehouse_management")
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
JWT_SECRET = os.getenv("JWT_SECRET", "change-me")
SMTP_SERVER = os.getenv("SMTP_SERVER", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
