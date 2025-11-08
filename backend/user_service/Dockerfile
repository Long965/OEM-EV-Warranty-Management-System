FROM python:3.10-slim

WORKDIR /app

COPY user_service/requirements.txt /tmp/requirements-user.txt
RUN pip install --no-cache-dir -r /tmp/requirements-user.txt
RUN pip install cryptography pymysql

COPY user_service/ /app/user_service/
COPY shared/ /app/shared/

ENV PYTHONPATH=/app

EXPOSE 8002
CMD ["uvicorn", "user_service.main:app", "--host", "0.0.0.0", "--port", "8002"]
