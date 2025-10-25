import httpx
from fastapi import Request, Response

async def forward_request(request: Request, upstream_url: str):
    async with httpx.AsyncClient() as client:
        body = await request.body()
        response = await client.request(
            method=request.method,
            url=upstream_url,
            headers=request.headers,
            content=body
        )
        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=dict(response.headers)
        )
