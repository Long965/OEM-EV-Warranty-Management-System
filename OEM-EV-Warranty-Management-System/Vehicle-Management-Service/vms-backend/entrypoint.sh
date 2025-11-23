#!/bin/sh

# Đảm bảo rằng DB đã sẵn sàng, lặp lại tối đa 30 lần
echo "Waiting for MySQL database to start..."
while ! nc -z db 3306; do
  sleep 0.5
done
echo "MySQL started! Running Django server."

# Thực thi lệnh chính của container (chạy server Django)
exec "$@"