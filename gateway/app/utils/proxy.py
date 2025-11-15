# gateway/app/utils/proxy.py

import httpx
from fastapi import Request
from starlette.responses import Response, JSONResponse

async def proxy_request(request: Request, backend_url: str) -> Response:
    client = httpx.AsyncClient(base_url=backend_url)

    # path sẽ là "/parts/" hoặc "/parts/123"
    path = request.scope['path'] 
    query = request.url.query
    
    data = await request.body()
    
    headers = dict(request.headers)
    headers.pop('host', None)
    headers.pop('content-length', None)

    try:
        # Gửi request đến: http://backend:8100/parts/
        response = await client.request(
            method=request.method,
            url=path + ("?" + query if query else ""),
            headers=headers,
            content=data
        )

        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=response.headers,
            media_type=response.headers.get("content-type")
        )

    except httpx.ConnectError:
        return JSONResponse(
            content={"detail": "Backend service is unavailable."},
            status_code=503
        )