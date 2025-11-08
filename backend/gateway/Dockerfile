FROM python:3.10-slim
WORKDIR /app

COPY gateway/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt
RUN pip install cryptography pymysql httpx fastapi uvicorn

COPY gateway/ /app/gateway/
COPY shared/ /app/shared/

ENV PYTHONPATH=/app:/app/gateway

EXPOSE 8000
CMD ["uvicorn", "gateway.app.main:app", "--host", "0.0.0.0", "--port", "8000"]