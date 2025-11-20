# Sử dụng Python 3.11 làm base image (Python 3.14 chưa phổ biến)
FROM python:3.11-slim-bullseye

# Thiết lập biến môi trường
ENV PYTHONUNBUFFERED 1

# Cài đặt các gói hệ thống cần thiết (gcc, libmysqlclient-dev,...)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       gcc \
       default-libmysqlclient-dev \
       build-essential \
    && rm -rf /var/lib/apt/lists/*

# Thiết lập thư mục làm việc
WORKDIR /usr/src/app

# Sao chép file requirements.txt
COPY requirements.txt /usr/src/app/

# Cài đặt các dependencies từ requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Cài đặt thêm gói djangorestframework-simplejwt
RUN pip install djangorestframework-simplejwt

# Sao chép toàn bộ source code của dự án
COPY . /usr/src/app/

# Định nghĩa lệnh mặc định chạy khi container khởi động
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]