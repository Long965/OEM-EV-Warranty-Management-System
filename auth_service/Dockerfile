FROM python:3.10-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install cryptography pymysql

COPY . .

# Thêm dòng này để Python hiểu /app là module root
ENV PYTHONPATH=/app

EXPOSE 8001
CMD ["sh", "-c", "python -m auth_service.init_db && uvicorn auth_service.main:app --host 0.0.0.0 --port 8001"]
