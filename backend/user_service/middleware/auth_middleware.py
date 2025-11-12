from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Cho phép các route public (healthcheck,...)
        if request.method == "OPTIONS":
            return await call_next(request)

        auth_header = request.headers.get("Authorization")
        if auth_header:
            # Giữ nguyên token, không decode lại (đã được Gateway xác thực)
            request.state.auth_header = auth_header
        else:
            request.state.auth_header = None
        return await call_next(request)