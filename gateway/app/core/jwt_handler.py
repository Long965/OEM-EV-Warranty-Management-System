# gateway/app/core/jwt_handler.py

import jwt
import os
from fastapi import HTTPException
from starlette import status

# Lấy JWT_SECRET từ biến môi trường.
JWT_SECRET = os.getenv("JWT_SECRET", "your-default-secret-key-if-not-set")
ALGORITHM = "HS256" # Tự định nghĩa thuật toán ở đây

class InvalidToken(HTTPException):
    def __init__(self, detail: str = "Invalid or expired token"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise InvalidToken(detail="Token has expired")
    except jwt.InvalidTokenError:
        raise InvalidToken(detail="Invalid token")