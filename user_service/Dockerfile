FROM python:3.10-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install cryptography pymysql

COPY . .
ENV PYTHONPATH=/app

EXPOSE 8002
CMD ["uvicorn", "user_service.main:app", "--host", "0.0.0.0", "--port", "8002"]
