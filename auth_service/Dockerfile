FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install cryptography

# Copy toàn bộ thư mục service vào /app/auth_service
COPY . /app/auth_service

EXPOSE 8001

# Chạy đúng theo module
CMD ["sh", "-c", "python -m auth_service.init_db && uvicorn auth_service.main:app --host 0.0.0.0 --port 8001"]
