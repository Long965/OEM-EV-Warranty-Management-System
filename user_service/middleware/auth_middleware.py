from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
import jwt, os

JWT_SECRET = os.getenv("JWT_SECRET", "default-secret")

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        auth = request.headers.get("Authorization")
        if not auth or not auth.startswith("Bearer "):
            request.state.user = None
            return await call_next(request)

        token = auth.split(" ")[1]
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            request.state.user = payload  # chứa username & role
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid or expired token")

        return await call_next(request)
