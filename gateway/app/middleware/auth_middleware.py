# File: gateway/app/middleware/auth_middleware.py (Hoàn chỉnh - Sửa lỗi Logic)

from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, HTTPException
from app.core.jwt_handler import decode_token, InvalidToken

class AuthMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, exempt_paths=None):
        super().__init__(app)
        # 1. Lưu lại các đường dẫn CHÍNH XÁC (exact paths) từ main.py
        # (Chủ yếu là cho trang chủ "/")
        self.exempt_exact_paths = exempt_paths or []
        
        # 2. ĐỊNH NGHĨA CỨNG (Hardcode) các prefix (tiền tố) cần bỏ qua
        # (Tách biệt khỏi exempt_paths)
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

        # 1. Kiểm tra "exact match" (khớp chính xác)
        # Ví dụ: "/" (trang chủ)
        if path in self.exempt_exact_paths:
            return await call_next(request)

        # 2. Kiểm tra "prefix" (bắt đầu bằng)
        # Ví dụ: "/docs/..." hoặc "/auth/login/..." (nếu có)
        if any(path.startswith(p) for p in self.exempt_prefixes):
            return await call_next(request)

        # --- TỪ ĐÂY, /parts/ SẼ ĐƯỢC XỬ LÝ ---
        # (Vì "/parts/" không có trong exempt_exact_paths
        #  và không bắt đầu bằng "/auth/..." hoặc "/docs/...")

        auth_header = request.headers.get("authorization") or request.headers.get("Authorization")
        
        print(f"\n=== AUTH MIDDLEWARE RUNNING ON: {path} ===") # Log
        
        if not auth_header:
            raise HTTPException(status_code=401, detail="Missing Authorization header")

        try:
            # Đảm bảo logic tách "Bearer "
            token = auth_header.split(" ")[1]
        except IndexError:
            raise HTTPException(status_code=401, detail="Malformed Authorization header (Expected 'Bearer <token>')")

        try:
            payload = decode_token(token)
        except InvalidToken as e:
            # Trả về lỗi chi tiết từ jwt_handler
            raise HTTPException(status_code=401, detail=str(e)) 

        # ✅ GÁN USER VÀO STATE
        request.state.user = payload
        return await call_next(request)