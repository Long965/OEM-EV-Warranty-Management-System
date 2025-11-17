# auth_service/init_db.py

import os
import time
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError

# Lấy URL từ biến môi trường
DATABASE_URL = os.getenv("DATABASE_URL")

# Tên DB mà script này sẽ tạo (lấy từ log của bạn)
DB_NAME = "ev_warranty_db" 

# 1. Tạo Engine không có tên DB (để tạo DB)
# Thay thế 'ev_warranty_db' bằng ''
db_server_url = DATABASE_URL.replace(f"/{DB_NAME}", "/")

# 2. Tạo Engine có tên DB (để tạo Bảng)
db_with_name_url = DATABASE_URL

# --- SQL ĐỂ TẠO BẢNG ---
# (Lấy từ log của bạn)
create_roles_table = text(f"""
CREATE TABLE IF NOT EXISTS roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);
""")

create_users_table = text(f"""
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE,
    role_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);
""")

# (Bạn có thể thêm CREATE TABLE cho user_profiles và tokens ở đây nếu muốn)

# --- SQL ĐỂ INSERT DỮ LIỆU ROLES ---
insert_roles = text(f"""
INSERT IGNORE INTO roles (role_id, role_name, description) VALUES
(1, 'Admin', 'System administrator'),
(2, 'SC_Staff', 'Service Center Staff'),
(3, 'SC_Technician', 'Service Center Technician'),
(4, 'EVM_Staff', 'Manufacturer Staff');
""")


def init_database():
    print("Waiting for database...")
    retries = 10
    engine_server = create_engine(db_server_url)

    while retries > 0:
        try:
            with engine_server.connect() as conn:
                print("Database server connection successful.")
                break
        except OperationalError:
            print("Database not ready yet, waiting...")
            retries -= 1
            time.sleep(3)
    
    if retries == 0:
        print("Could not connect to database server. Exiting.")
        exit(1)

    # --- 1. Tạo Database (ev_warranty_db) ---
    # Sử dụng engine.begin() để TỰ ĐỘNG COMMIT
    try:
        with engine_server.begin() as conn:
            conn.execute(text(f"CREATE DATABASE IF NOT EXISTS {DB_NAME};"))
            print(f"Database '{DB_NAME}' created or already exists.")
    except Exception as e:
        print(f"Error creating database: {e}")
        # Không thoát, vì DB có thể đã tồn tại nhưng user không có quyền CREATE

    # --- 2. Tạo Bảng và Insert Dữ liệu (Dùng Engine mới) ---
    # Engine này kết nối trực tiếp vào DB 'ev_warranty_db'
    engine_db = create_engine(db_with_name_url)

    # Sử dụng engine.begin() để TỰ ĐỘNG COMMIT
    try:
        with engine_db.begin() as conn:
            print("Creating table 'roles'...")
            conn.execute(create_roles_table)
            
            print("Creating table 'users'...")
            conn.execute(create_users_table)
            
            # (Thêm execute cho các bảng khác ở đây)
            
            print("Inserting default roles...")
            conn.execute(insert_roles) # <-- LỆNH NÀY SẼ ĐƯỢC COMMIT
            
            print("✅ Database and tables initialized successfully.")
    
    except Exception as e:
        print(f"An error occurred during table initialization: {e}")
        exit(1)

if __name__ == "__main__":
    init_database()