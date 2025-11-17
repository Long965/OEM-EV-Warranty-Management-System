# auth_service/Dockerfile

FROM python:3.10-slim
WORKDIR /app
RUN pip install --upgrade pip

# ✅ SỬA LẠI: Đường dẫn bây giờ phải bao gồm 'auth_service/'
COPY ./auth_service/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# ✅ SỬA LẠI: Copy code từ 'auth_service/' vào /app
COPY ./auth_service/ /app/

# ✅ THÊM MỚI: Copy thư mục 'shared/' vào /app/shared
COPY ./shared/ /app/shared/

# Thiết lập PYTHONPATH để Python tìm thấy cả /app và /app/shared
ENV PYTHONPATH=/app

# Lệnh chạy
CMD ["sh", "-c", "python init_db.py && uvicorn main:app --host 0.0.0.0 --port 8001"]