# Sử dụng image Python
FROM python:3.10

# Làm việc trong thư mục /app
WORKDIR /app

# Copy requirements và cài đặt
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ mã nguồn
COPY . .

# Cài thêm netcat để kiểm tra kết nối MySQL
RUN apt-get update && apt-get install -y netcat-openbsd

# Chạy lệnh chờ MySQL sẵn sàng trước khi khởi động FastAPI
CMD ["sh", "-c", "until nc -z mysql-db 3306; do echo '⏳ Waiting for MySQL...'; sleep 2; done; echo '✅ MySQL ready!'; uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"]
