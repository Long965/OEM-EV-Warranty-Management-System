# File: auth_service/core/security.py (HOẶC file tương tự)

import os
from jose import jwt
from datetime import datetime, timedelta

# ✅ SỬA LỖI: Hardcode trực tiếp Secret Key
# Đảm bảo nó GIỐNG HỆT với Gateway
JWT_SECRET = "very-secret-change-me" 
ALGORITHM = "HS256"

def create_access_token(data: dict, expires_delta: timedelta = None):
    # ... (code tạo token của bạn) ...
    to_encode = data.copy()
    # ...
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)
    return encoded_jwt