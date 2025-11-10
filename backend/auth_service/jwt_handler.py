import jwt, os
from datetime import datetime, timedelta

JWT_SECRET = os.getenv("JWT_SECRET", "default-secret")
ACCESS_TOKEN_HOURS = int(os.getenv("ACCESS_TOKEN_HOURS", "8"))
JWT_ALGORITHM = "HS256"


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

# Giải mã JWT
def decode_token(token: str):
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise ValueError("Token expired")
    except jwt.InvalidTokenError:
        raise ValueError("Invalid token")
