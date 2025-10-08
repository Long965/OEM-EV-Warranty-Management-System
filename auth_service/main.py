from fastapi import FastAPI
import jwt, datetime, os

app = FastAPI()
JWT_SECRET = os.getenv("JWT_SECRET", "very-secret-change-me")
JWT_ALG = os.getenv("JWT_ALGORITHM", "HS256")

@app.post("/login")
async def login(data: dict):
    # nhận username/password (Ở stub: không kiểm tra mật khẩu)
    username = data.get("username", "user1")
    payload = {
        "sub": username,
        "role": "EVM_Staff",
        "exp": int(datetime.datetime.utcnow().timestamp()) + 3600
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)
    return {"access_token": token, "token_type": "bearer"}

@app.get("/verify")
async def verify(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        return {"valid": True, "payload": payload}
    except jwt.PyJWTError:
        return {"valid": False}

