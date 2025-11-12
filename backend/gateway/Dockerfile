FROM python:3.11-slim

WORKDIR /app
COPY gateway/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt
RUN pip install --no-cache-dir cryptography pymysql httpx fastapi uvicorn

COPY gateway/ /app/
COPY shared/ /app/shared/
ENV PYTHONPATH=/app:/app/shared
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
