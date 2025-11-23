FROM python:3.11-slim

WORKDIR /app

# BƯỚC MỚI: Cài đặt netcat (nc) để kiểm tra kết nối DB
RUN apt-get update && \
    apt-get install -y default-libmysqlclient-dev gcc pkg-config netcat-openbsd && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# BƯỚC MỚI: Sao chép entrypoint script
COPY . /app/
RUN python manage.py collectstatic --noinput
RUN chmod +x /app/entrypoint.sh # Cấp quyền thực thi cho script

# THAY ĐỔI LỆNH: Gọi script entrypoint trước
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]