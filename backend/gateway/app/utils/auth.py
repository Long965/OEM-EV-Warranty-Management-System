import jwt
from fastapi import HTTPException, Request

JWT_SECRET = "default-secret"
ALGORITHM = "HS256"

def get_user_from_token(request: Request):
    auth = request.headers.get("Authorization")
    if not auth:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    try:
        token = auth.split(" ")[1]
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        return {
            "user_id": payload.get("sub"),     # username
            "role": payload.get("role")        # role name
        }
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
