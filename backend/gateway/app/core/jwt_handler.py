from app.core.config import JWT_SECRET, JWT_ALGORITHM, VERIFY_JWT
import jwt

class InvalidToken(Exception):
    pass

def decode_token(token: str) -> dict:
    if not VERIFY_JWT:
        # development mode: skip verification
        return {}
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.PyJWTError as e:
        raise InvalidToken("Invalid token") from e
