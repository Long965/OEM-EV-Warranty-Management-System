FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY auth_service/requirements.txt /tmp/requirements-auth.txt
RUN pip install --no-cache-dir -r /tmp/requirements-auth.txt
RUN pip install cryptography pymysql

# Copy source code
COPY auth_service/ /app/auth_service/
COPY shared/ /app/shared/

# Set Python path
ENV PYTHONPATH=/app

# Expose port
EXPOSE 8001

# OPTION 1: Nếu main.py nằm trong /app/auth_service/
CMD ["uvicorn", "auth_service.main:app", "--host", "0.0.0.0", "--port", "8001", "--reload"]

# OPTION 2: Nếu muốn chạy trực tiếp từ thư mục auth_service
# WORKDIR /app/auth_service
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001", "--reload"]