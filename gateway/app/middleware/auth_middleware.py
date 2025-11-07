from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, HTTPException
from app.core.jwt_handler import decode_token, InvalidToken

class AuthMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, exempt_paths=None):
        super().__init__(app)
        # exempt_paths: list of path prefixes that don't require JWT (login, register, health...)
        self.exempt_paths = exempt_paths or ["/auth/login", "/auth/register", "/"]

    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        if request.method == "OPTIONS":
            return await call_next(request)

        if any(path.startswith(p) for p in self.exempt_paths):
            return await call_next(request)

        auth_header = request.headers.get("Authorization")
        if not auth_header:
            raise HTTPException(status_code=401, detail="Missing Authorization header")

        try:
            token = auth_header.split(" ")[1] if " " in auth_header else auth_header
        except Exception:
            raise HTTPException(status_code=401, detail="Malformed Authorization header")

        try:
            payload = decode_token(token)
        except InvalidToken:
            raise HTTPException(status_code=401, detail="Invalid or expired token")

        request.state.user = payload
        return await call_next(request)
