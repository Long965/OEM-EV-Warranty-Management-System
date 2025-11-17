# File: gateway/app/utils/proxy.py (Hoàn chỉnh - Sửa lỗi 500)

import httpx
import os
from fastapi import Request
# ✅ SỬA LỖI: Import StreamingResponse thay vì Response
from starlette.responses import StreamingResponse 

async def proxy_request(request: Request, target_base_url: str):
    """
    Một hàm proxy linh hoạt:
    - Nhận request gốc.
    - Nhận URL của dịch vụ đích (AUTH_URL hoặc BACKEND_URL).
    - Tự động forward Header "Authorization" NẾU NÓ TỒN TẠI.
    """
    
    # 1. Lấy Header "Authorization" (nếu có)
    headers_to_forward = {}
    auth_header = request.headers.get("Authorization")
    if auth_header:
        headers_to_forward["Authorization"] = auth_header 
    
    content_type = request.headers.get("Content-Type")
    if content_type:
        headers_to_forward["Content-Type"] = content_type

    # 2. Lấy URL đích
    target_path = request.url.path
    # Xử lý query params nếu có
    if request.query_params:
        target_url = f"{target_base_url}{target_path}?{request.query_params}"
    else:
        target_url = f"{target_base_url}{target_path}"
    
    # 3. Lấy Body (nếu là POST/PUT)
    body_data = await request.body()

    # 4. Thực hiện request đến dịch vụ đích
    async with httpx.AsyncClient() as client:
        try:
            # Sử dụng stream=True để xử lý phản hồi lớn
            response = await client.request(
                method=request.method,
                url=target_url,
                headers=headers_to_forward,
                content=body_data,
                timeout=30.0
            )
            
            # 5. ✅ SỬA LỖI: Lọc các "hop-by-hop" header
            # Không thể sao chép 'content-encoding' hoặc 'transfer-encoding'
            # vì chúng sẽ làm crash Uvicorn.
            headers_to_return = {
                name: value for name, value in response.headers.items()
                if name.lower() not in (
                    'content-encoding',
                    'transfer-encoding',
                    'connection',
                    'content-length', # Starlette sẽ tự tính toán
                )
            }

            # 6. Trả lại phản hồi bằng StreamingResponse (tối ưu nhất)
            return StreamingResponse(
                response.aiter_bytes(), # Stream nội dung
                status_code=response.status_code,
                headers=headers_to_return # Sử dụng header đã lọc
            )
            
        except httpx.ConnectError as e:
            service_name = target_base_url.split("//")[-1]
            return Response(
                content=f"Error connecting to service: {service_name}. Details: {e}",
                status_code=503, # Service Unavailable
            )
        except httpx.RequestError as e:
            return Response(
                content=f"Error during proxy request: {e}",
                status_code=500, # Internal Server Error
            )