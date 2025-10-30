FROM python:3.10-slim

WORKDIR /app/user_service

COPY requirements.txt /app/user_service/
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app/user_service

EXPOSE 8002
CMD ["python", "main.py"]
