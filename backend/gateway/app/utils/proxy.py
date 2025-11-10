# app/utils/proxy.py
import httpx
from fastapi import Request, Response

async def forward_request(request: Request, upstream_url: str, timeout: float = 20.0):
    async with httpx.AsyncClient() as client:
        body = await request.body()
        headers = dict(request.headers)
        headers.pop("host", None)
        # optional: log presence of Authorization
        if headers.get("authorization"):
            print("[Gateway] Forwarding Authorization header present")
        try:
            resp = await client.request(
                method=request.method,
                url=upstream_url,
                headers=headers,
                params=dict(request.query_params),
                content=body,
                timeout=timeout
            )
        except httpx.RequestError as e:
            return Response(content=f"Upstream request failed: {e}", status_code=502)
        # return with headers (drop hop-by-hop)
        excluded = ("content-encoding","transfer-encoding","connection")
        content_type = resp.headers.get("content-type")
        response = Response(content=resp.content, status_code=resp.status_code, media_type=content_type)
        for k,v in resp.headers.items():
            if k.lower() in excluded: continue
            response.headers[k] = v
        return response
