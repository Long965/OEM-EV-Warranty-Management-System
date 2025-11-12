from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
from app.core.jwt_handler import decode_token

class AuthMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, exempt_paths=None):
        super().__init__(app)
        self.exempt_paths = exempt_paths or ["/auth/login", "/auth/register", "/"]

    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        # Cho phép OPTIONS (CORS preflight)
        if request.method == "OPTIONS":
            return await call_next(request)

        # Bỏ qua các route không cần xác thực
        if any(path.startswith(p) for p in self.exempt_paths):
            return await call_next(request)

        # Nếu có Authorization header → decode thử
        auth_header = request.headers.get("Authorization")
        if auth_header and " " in auth_header:
            token = auth_header.split(" ")[1]
            try:
                payload = decode_token(token)
                request.state.user = payload
            except Exception:
                # Không raise 401, để service phía sau tự xử lý
                request.state.user = None
        else:
            request.state.user = None

        return await call_next(request)