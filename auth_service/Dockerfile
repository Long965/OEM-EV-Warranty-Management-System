# Sử dụng base image Python
FROM python:3.10-slim

WORKDIR /app

# Sao chép file cần thiết
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8001

# Lệnh chạy service
CMD ["uvicorn", "auth_service.main:app", "--host", "0.0.0.0", "--port", "8001"]
