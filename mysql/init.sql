CREATE DATABASE IF NOT EXISTS ev_warranty_db;
USE ev_warranty_db;

-- ===== TABLES =====

CREATE TABLE IF NOT EXISTS roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    role_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

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

CREATE TABLE IF NOT EXISTS tokens (
    token_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    access_token TEXT NOT NULL,
    issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- ===== INITIAL DATA =====

INSERT IGNORE INTO roles (role_name, description) VALUES
('Admin', 'System administrator'),
('SC_Staff', 'Service Center Staff'),
('SC_Technician', 'Service Center Technician'),
('EVM_Staff', 'Electric Vehicle Manufacturer Staff');

-- ===== DEFAULT ADMIN USER =====
-- Password = admin123
-- Hash được tạo bằng passlib[bcrypt]
-- Bạn có thể xác thực bằng JSON: {"username": "admin", "password": "admin123"}

INSERT IGNORE INTO users (username, password_hash, email, role_id)
VALUES (
    'admin',
    '$2b$12$9sHz1U1y6xTiy4JZ3CMZQO0b5EB2.ahHjG5OFOFXdG.LzI9S44OZm', -- bcrypt hash of "admin123"
    'admin@example.com',
    (SELECT role_id FROM roles WHERE role_name = 'Admin')
);
