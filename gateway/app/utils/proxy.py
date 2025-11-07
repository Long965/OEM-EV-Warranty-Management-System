# gateway/app/utils/proxy.py
import httpx
from fastapi import Request, Response

# Header names hop-by-hop to remove (per RFC7230)
HOP_BY_HOP = {
    "connection", "keep-alive", "proxy-authenticate", "proxy-authorization",
    "te", "trailers", "transfer-encoding", "upgrade", "host"
}

async def forward_request(request: Request, upstream_url: str):
    async with httpx.AsyncClient(timeout=30.0) as client:
        body = await request.body()
        # build headers dict and drop hop-by-hop headers
        headers = {k: v for k, v in request.headers.items() if k.lower() not in HOP_BY_HOP}

        # send request to upstream
        resp = await client.request(
            method=request.method,
            url=upstream_url,
            headers=headers,
            content=body
        )

        # build response (filter out hop-by-hop response headers)
        response_headers = {k: v for k, v in resp.headers.items() if k.lower() not in HOP_BY_HOP}

        return Response(content=resp.content, status_code=resp.status_code, headers=response_headers)
