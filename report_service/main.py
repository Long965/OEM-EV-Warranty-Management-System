from fastapi import FastAPI, Header, HTTPException, Request
import json

app = FastAPI()

@app.get("/stats")
async def stats(request: Request, authorization: str = Header(None), x_user: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing token")

    # Giải mã header X-User (do Gateway thêm)
    user_info = None
    if x_user:
        try:
            user_info = json.loads(x_user)
        except Exception:
            user_info = {"error": "Cannot decode X-User"}

    return {
        "claims": {"approved": 10, "pending": 2},
        "note": "from report service",
        "user_info": user_info,
        "auth_header": authorization
    }
