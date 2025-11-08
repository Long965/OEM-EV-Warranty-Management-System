# backend/gateway/Dockerfile
FROM python:3.10-slim

WORKDIR /app

# Cài thư viện
COPY gateway/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt
RUN pip install cryptography pymysql httpx fastapi uvicorn

# Copy code
COPY gateway/ /app/gateway/
COPY shared/ /app/shared/

# Cho phép import từ /app
ENV PYTHONPATH=/app:/app/gateway

EXPOSE 8000

# 👉 Chạy đúng module gateway.app.main
CMD ["uvicorn", "gateway.app.main:app", "--host", "0.0.0.0", "--port", "8000"]