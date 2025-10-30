FROM python:3.10-slim

# Đặt thư mục làm việc gốc
WORKDIR /app

# Cài đặt dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ mã nguồn auth_service vào /app/auth_service
COPY . /app/auth_service

# Chuyển vào thư mục module
WORKDIR /app/auth_service

# Expose port cho service
EXPOSE 8001

# Chạy module chính
CMD ["python", "-m", "auth_service.main"]
