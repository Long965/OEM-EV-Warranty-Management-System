import httpx
from fastapi import Request, HTTPException

async def proxy_request(request: Request, base_url: str, path: str):
    url = f"{base_url}{path}"

    try:
        async with httpx.AsyncClient() as client:
            res = await client.request(
                method=request.method,
                url=url,
                headers=request.headers.raw,
                content=await request.body()
            )

        return res.json()

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
