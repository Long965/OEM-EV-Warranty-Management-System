from fastapi import APIRouter, Request
from app.core.config import REPORT_SERVICE_URL
from app.utils.proxy import forward_request

router = APIRouter()


def create_proxy_handler(http_method: str):
    async def proxy(request: Request, full_path: str):
        upstream = f"{REPORT_SERVICE_URL}/{full_path.lstrip('/')}"
        return await forward_request(request, upstream)
    return proxy


# Đăng ký route cho từng method để Swagger nhận đúng
for method in ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]:
    router.add_api_route(
        "/{full_path:path}",
        endpoint=create_proxy_handler(method),
        methods=[method],
        include_in_schema=True,
    )
