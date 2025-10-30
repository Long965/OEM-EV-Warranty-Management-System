FROM python:3.10-slim

WORKDIR /app/auth_service
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

EXPOSE 8001

CMD ["sh", "-c", "python init_db.py && python main.py"]
