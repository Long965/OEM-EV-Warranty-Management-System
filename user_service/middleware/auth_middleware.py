# user_service/middleware/auth_middleware.py (simplified)
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # allow public endpoints as needed (e.g., health)
        auth = request.headers.get("Authorization")
        if not auth:
            request.state.user = None
            return await call_next(request)

        # do not decode here if gateway already validated; 
        # but keep token payload for convenience:
        try:
            token = auth.split(" ")[1] if " " in auth else auth
            # Optionally decode here - keep as-is or remove
            import jwt, os
            payload = jwt.decode(token, os.getenv("JWT_SECRET", "default-secret"), algorithms=["HS256"])
            request.state.user = payload
        except Exception:
            request.state.user = None
        return await call_next(request)
