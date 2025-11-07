FROM python:3.10-slim

# Đặt thư mục làm root /app (chứ không phải /app/auth_service)
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install cryptography pymysql

# Copy tất cả vào /app (giữ nguyên cấu trúc thư mục)
COPY . .

# Expose đúng port
EXPOSE 8001

# Chạy theo đúng module path
CMD ["sh", "-c", "python -m auth_service.init_db && uvicorn auth_service.main:app --host 0.0.0.0 --port 8001"]
