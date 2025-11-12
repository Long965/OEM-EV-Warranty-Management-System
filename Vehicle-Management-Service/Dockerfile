# 1. Chọn "nguyên liệu" - dùng Python 3.13
FROM python:3.13-slim

# 2. Tạo một thư mục làm việc bên trong
WORKDIR /app

# 3. Copy file requirements.txt (vừa tạo) vào trước
COPY requirements.txt .

# 4. Chạy lệnh pip install để cài đặt tất cả thư viện
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy tất cả code của bạn vào
COPY . .

# 6. LỆNH CHẠY MỚI (Đã sửa)
# Nó sẽ chạy "wait-for-db.py" TRƯỚC
# Nếu "wait-for-db.py" chạy xong (kết nối DB thành công),
# nó mới chạy "uvicorn" (dấu &&)
CMD ["sh", "-c", "python wait-for-db.py && uvicorn main:app --host 0.0.0.0 --port 8000"]