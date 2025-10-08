from fastapi import Request, HTTPException

def require_roles(*roles):
    def decorator(func):
        async def wrapper(*args, **kwargs):
            request: Request = kwargs.get("request") or args[0]
            user = getattr(request.state, "user", {})
            user_role = user.get("role")
            if user_role not in roles:
                raise HTTPException(status_code=403, detail="Permission denied")
            return await func(*args, **kwargs)
        return wrapper
    return decorator
