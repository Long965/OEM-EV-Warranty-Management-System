import httpx
from fastapi import Request, Response, HTTPException

async def forward_request(request: Request, upstream_url: str):
    async with httpx.AsyncClient() as client:
        try:
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
        except httpx.RequestError as e:
            raise HTTPException(status_code=502, detail=f"Upstream service unavailable: {e}")
