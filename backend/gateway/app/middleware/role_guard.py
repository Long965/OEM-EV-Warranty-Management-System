from fastapi import Request, HTTPException
from functools import wraps

def require_roles(*roles):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            request: Request = kwargs.get("request") or args[0]
            user = getattr(request.state, "user", None)
            if not user:
                raise HTTPException(status_code=401, detail="Missing or invalid token")
            if user.get("role") not in roles:
                raise HTTPException(status_code=403, detail="Access denied")
            return await func(*args, **kwargs)
        return wrapper
    return decorator
