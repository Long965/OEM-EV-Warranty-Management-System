# Sử dụng base image Python
FROM python:3.10-slim

WORKDIR /app/auth_service

# Sao chép file cần thiết
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8001

# Lệnh chạy service
CMD ["python", "-m", "auth_service.main"]
