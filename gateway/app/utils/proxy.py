import httpx
from starlette.responses import Response

async def forward_request(request, upstream_url: str, timeout: float = 30.0, json_body=None) -> Response:
    async with httpx.AsyncClient() as client:
        headers = dict(request.headers)
        headers.pop("host", None)
        headers["X-Source"] = "api-gateway"

        # ✅ Gửi JSON nếu có json_body, ngược lại gửi raw content
        if json_body is not None:
            resp = await client.request(
                method=request.method,
                url=upstream_url,
                headers=headers,
                params=dict(request.query_params),
                json=json_body,
                timeout=timeout,
            )
        else:
            body = await request.body()
            resp = await client.request(
                method=request.method,
                url=upstream_url,
                headers=headers,
                params=dict(request.query_params),
                content=body,
                timeout=timeout,
            )

        # ✅ Trả lại response từ service
        response = Response(
            content=resp.content,
            status_code=resp.status_code,
        )
        for k, v in resp.headers.items():
            if k.lower() not in ("content-encoding", "transfer-encoding", "connection"):
                response.headers[k] = v
        return response
