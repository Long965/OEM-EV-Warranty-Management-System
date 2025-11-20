FROM python:3.11-slim-bullseye

ENV PYTHONUNBUFFERED 1
ENV DJANGO_SETTINGS_MODULE user_identity_be.settings

# Cài đặt các gói hệ thống cần thiết
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       gcc default-libmysqlclient-dev build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Sao chép và cài đặt dependencies
COPY requirements.txt /usr/src/app/
RUN pip install --no-cache-dir -r requirements.txt

# Sao chép toàn bộ source code
COPY . /usr/src/app/

# Lệnh khởi chạy server Django
CMD ["python", "manage.py", "runserver", "0.0.0.0:8001"]