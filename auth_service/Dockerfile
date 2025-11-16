FROM python:3.10-slim

WORKDIR /app

COPY auth_service/requirements.txt /tmp/requirements-auth.txt
RUN pip install --no-cache-dir -r /tmp/requirements-auth.txt
RUN pip install cryptography pymysql

COPY auth_service/ /app/auth_service/
COPY shared/ /app/shared/

ENV PYTHONPATH=/app

EXPOSE 8001
CMD ["sh", "-c", "python -m auth_service.init_db && uvicorn auth_service.main:app --host 0.0.0.0 --port 8001"]
