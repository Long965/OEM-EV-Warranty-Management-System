FROM python:3.10-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app/user_service
WORKDIR /app/user_service

EXPOSE 8002

CMD ["python", "-m", "user_service.main"]
