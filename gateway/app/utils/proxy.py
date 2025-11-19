import httpx
from fastapi import Request, Response

async def forward_request(request: Request, upstream_url: str):
    headers = dict(request.headers)
    # Xóa host để tránh lỗi host mismatch
    headers.pop("host", None)

    async with httpx.AsyncClient() as client:
        body = await request.body()
        resp = await client.request(
            method=request.method,
            url=upstream_url,
            headers=headers,  # ✅ giữ nguyên Authorization header
            content=body,
        )
        return Response(
            content=resp.content,
            status_code=resp.status_code,
            headers=dict(resp.headers)
        )
