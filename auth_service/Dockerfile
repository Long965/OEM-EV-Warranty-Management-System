FROM python:3.10-slim

WORKDIR /app/auth_service

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN pip install cryptography

EXPOSE 8001

CMD ["sh", "-c", "python -m auth_service.init_db && uvicorn auth_service.main:app --host 0.0.0.0 --port 8001"]
