FROM python:3.10-slim

WORKDIR /app/auth_service

COPY requirements.txt /app/auth_service/
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app/auth_service

EXPOSE 8001
CMD ["python", "main.py"]
