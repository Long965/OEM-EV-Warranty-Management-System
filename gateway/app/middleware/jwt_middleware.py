# File: gateway/app/core/jwt_handler.py

import jwt
import os
from fastapi import HTTPException
from starlette import status

# ✅ SỬA LỖI: Load secret từ biến môi trường (không có giá trị mặc định sai)
JWT_SECRET = os.getenv("JWT_SECRET") 
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

# ✅ THÊM LOG: In ra secret key mà Gateway đang sử dụng khi khởi động
if not JWT_SECRET:
    print("--- 🔴 LỖI NGHIÊM TRỌNG: JWT_SECRET CHƯA ĐƯỢC SET ---")
else:
    print(f"--- 🔑 DEBUG: Gateway đang sử dụng JWT_SECRET: {JWT_SECRET[:4]}... ---")

class InvalidToken(HTTPException):
    def __init__(self, detail: str = "Invalid or expired token"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )

def decode_token(token: str) -> dict:
    if not JWT_SECRET:
        raise InvalidToken(detail="Server is missing JWT_SECRET configuration")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        print("--- DEBUG: Token giải mã thất bại (Token hết hạn) ---")
        raise InvalidToken(detail="Token has expired")
    except jwt.InvalidTokenError:
        print("--- DEBUG: Token giải mã thất bại (Sai chữ ký hoặc Secret không khớp) ---")
        raise InvalidToken(detail="Invalid or expired token")