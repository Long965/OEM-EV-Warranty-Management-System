-- File này sẽ tự động chạy khi MySQL khởi động lần đầu tiên (khi chưa có dữ liệu)

-- 1. Tạo Database cho Backend chính (Warehouse)
CREATE DATABASE IF NOT EXISTS warehouse_management;

-- 2. Tạo Database cho Auth/User Service
CREATE DATABASE IF NOT EXISTS ev_warranty_db;

-- 3. Tạo Database cho Warranty Claim Service (Mới)
CREATE DATABASE IF NOT EXISTS warranty_claim_service;

-- Cấp quyền (Thường root mặc định đã có, nhưng thêm cho chắc chắn nếu dùng user khác)
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%';
FLUSH PRIVILEGES;