# File: gateway/app/middleware/role_guard.py (Hoàn chỉnh)

from fastapi import Request, HTTPException
from functools import wraps

def require_roles(*roles):
    def decorator(func):
        @wraps(func)
        async def wrapper(request: Request, *args, **kwargs):
            # 1. Lấy user từ middleware
            user = getattr(request.state, "user", None)

            if not user:
                raise HTTPException(status_code=401, detail="Missing or invalid token (User not found in state)")

            # 2. Lấy vai trò (role)
            role = user.get("role") or user.get("role_name")

            # 3. ✅ THÊM LOG ĐỂ KIỂM TRA
            # Log này sẽ in ra: Yêu cầu "Admin", Token có "Admin"
            print(f"--- DEBUG ROLE GUARD ---")
            print(f"Endpoint requires: {roles}")
            print(f"Token contains:    {role}")
            print(f"------------------------")

            # 4. Kiểm tra
            if role not in roles:
                # Nếu không khớp, báo lỗi chi tiết
                raise HTTPException(
                    status_code=403, 
                    detail=f"Access denied. Role '{role}' does not have permission for roles {roles}."
                )

            # 5. Cho phép đi tiếp
            return await func(request, *args, **kwargs)

        return wrapper
    return decorator