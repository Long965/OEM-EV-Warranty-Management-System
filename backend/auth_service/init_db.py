from sqlalchemy import create_engine, text
import os
import time

DATABASE_URL = os.getenv("DATABASE_URL")

# Đợi MySQL container khởi động xong
time.sleep(10)

engine = create_engine(DATABASE_URL, echo=True)

with engine.connect() as conn:
    conn.execute(text("CREATE DATABASE IF NOT EXISTS ev_warranty_db;"))
    conn.execute(text("USE ev_warranty_db;"))

    conn.execute(text("""
    CREATE TABLE IF NOT EXISTS roles (
        role_id INT AUTO_INCREMENT PRIMARY KEY,
        role_name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT
    );
    """))

    conn.execute(text("""
    CREATE TABLE IF NOT EXISTS users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        email VARCHAR(100),
        role_id INT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles(role_id)
    );
    """))

    conn.execute(text("""
    CREATE TABLE IF NOT EXISTS user_profiles (
        profile_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNIQUE NOT NULL,
        full_name VARCHAR(100),
        phone VARCHAR(20),
        address VARCHAR(255),
        department VARCHAR(100),
        position VARCHAR(100),
        is_active BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
    );
    """))

    conn.execute(text("""
    CREATE TABLE IF NOT EXISTS tokens (
        token_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        access_token TEXT NOT NULL,
        issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
    );
    """))

    # Chèn dữ liệu roles mặc định nếu chưa có
    conn.execute(text("""
    INSERT IGNORE INTO roles (role_id, role_name, description) VALUES
    (1, 'Admin', 'System administrator'),
    (2, 'SC_Staff', 'Service Center Staff'),
    (3, 'SC_Technician', 'Service Center Technician'),
    (4, 'EVM_Staff', 'Manufacturer Staff');
    """))

    print("✅ Database and tables initialized successfully.")
