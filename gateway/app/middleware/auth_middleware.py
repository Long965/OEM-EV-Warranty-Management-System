# File: gateway/app/middleware/auth_middleware.py

from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
from fastapi.responses import JSONResponse  # <--- QUAN TRỌNG: Phải import cái này
from app.core.jwt_handler import decode_token, InvalidToken

class AuthMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, exempt_paths=None):
        super().__init__(app)
        self.exempt_exact_paths = exempt_paths or []
        self.exempt_prefixes = [
            "/auth/login", 
            "/auth/register",
            "/docs",
            "/openapi.json"
        ]

    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        if request.method == "OPTIONS":
            return await call_next(request)

        # 1. Kiểm tra "exact match" (ví dụ trang chủ "/")
        if path in self.exempt_exact_paths:
            return await call_next(request)

        # 2. Kiểm tra "prefix" (ví dụ /auth/..., /docs/...)
        if any(path.startswith(p) for p in self.exempt_prefixes):
            return await call_next(request)

        # --- TỪ ĐÂY, /parts/ SẼ ĐƯỢC XỬ LÝ ---
        
        print(f"\n=== AUTH MIDDLEWARE RUNNING ON: {path} ===") 

        auth_header = request.headers.get("authorization") or request.headers.get("Authorization")

        # 🛑 SỬA LỖI: Dùng return JSONResponse thay vì raise HTTPException
        if not auth_header:
            return JSONResponse(
                status_code=401,
                content={"detail": "Missing Authorization header"}
            )

        try:
            token = auth_header.split(" ")[1]
        except IndexError:
            return JSONResponse(
                status_code=401,
                content={"detail": "Malformed Authorization header (Expected 'Bearer <token>')"}
            )

        try:
            payload = decode_token(token)
        except InvalidToken as e:
            return JSONResponse(
                status_code=401,
                content={"detail": str(e)}
            )

        # ✅ GÁN USER VÀO STATE
        request.state.user = payload
        
        response = await call_next(request)
        return response