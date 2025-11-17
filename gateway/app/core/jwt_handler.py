# gateway/app/core/jwt_handler.py
import jwt
import os
from fastapi import HTTPException
from starlette import status

# ✅ SỬA LỖI: Đảm bảo Gateway đọc JWT_SECRET từ biến môi trường
# Biến này được truyền từ docker-compose.yml
JWT_SECRET = "very-secret-change-me" 
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

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