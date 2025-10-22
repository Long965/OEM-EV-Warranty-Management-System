# ---- Base image ----
FROM python:3.11-slim

# ---- Working directory ----
WORKDIR /app

# ---- Environment ----
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# ---- Install system dependencies ----
# Cài PostgreSQL client để có lệnh pg_isready (kiểm tra DB)
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

# ---- Install Python dependencies ----
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ---- Copy source code ----
COPY app ./app

# ✅ Tạo thư mục uploads (nếu chưa có) và cấp quyền ghi
RUN mkdir -p /app/app/uploads && chmod -R 777 /app/app/uploads

# ---- Expose port ----
EXPOSE 8000

# ---- Run app ----
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
