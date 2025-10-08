import httpx
import json
from starlette.responses import Response

async def forward_request(request, upstream_url: str, timeout: float = 30.0) -> Response:
    """
    Forward the incoming Request to upstream_url and return Response.
    upstream_url is full URL for the upstream endpoint, e.g. http://auth:8001/login
    """
    async with httpx.AsyncClient() as client:
        headers = dict(request.headers)
        headers.pop("host", None)
        headers["X-Source"] = "api-gateway"
        # keep Authorization header if present
        body = await request.body()
        resp = await client.request(
            method=request.method,
            url=upstream_url,
            headers=headers,
            params=dict(request.query_params),
            content=body,
            timeout=timeout
        )
        if hasattr(request.state, "user"):
            headers["X-User"] = json.dumps(request.state.user)
    # Build response for client. Note: skip hop-by-hop headers if needed.
    response = Response(content=resp.content, status_code=resp.status_code)
    for k, v in resp.headers.items():
        # avoid some hop-by-hop headers
        if k.lower() in ("content-encoding","transfer-encoding","connection"):
            continue
        response.headers[k] = v
    return response
