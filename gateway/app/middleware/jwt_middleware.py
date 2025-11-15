from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
import jwt, os

JWT_SECRET = os.getenv("JWT_SECRET")

class JWTMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        auth = request.headers.get("Authorization")
        if auth and auth.startswith("Bearer "):
            token = auth.split(" ")[1]
            try:
                payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
                request.state.user = payload
            except Exception:
                request.state.user = None
        return await call_next(request)
