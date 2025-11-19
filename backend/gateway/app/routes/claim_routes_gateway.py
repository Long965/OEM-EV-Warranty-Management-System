from fastapi import APIRouter, HTTPException, Request, Query
import httpx
import os
import jwt

router = APIRouter(tags=["Warranty Claim Gateway"])

CLAIM_SERVICE_URL = os.getenv("CLAIM_SERVICE_URL", "http://warranty-claim-service:8082")
JWT_SECRET = os.getenv("JWT_SECRET", "default-secret")
JWT_ALGORITHM = "HS256"


def decode_token(request: Request):
    auth = request.headers.get("Authorization")
    if not auth:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    token = auth.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


# --------------------------------------------
# LIST CLAIMS
# --------------------------------------------
@router.get("/", summary="List Claims (proxy)")
async def list_claims(request: Request):
    user = decode_token(request)

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{CLAIM_SERVICE_URL}/claims/",
            headers={
                "x-user-id": user["sub"],
                "x-user-role": user["role"]
            }
        )

    if resp.status_code >= 400:
        raise HTTPException(resp.status_code, resp.text)
    return resp.json()


# --------------------------------------------
# CREATE CLAIM
# --------------------------------------------
@router.post("/", summary="Create Claim (proxy)")
async def create_claim(request: Request):
    user = decode_token(request)
    body = await request.json()

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{CLAIM_SERVICE_URL}/claims/",
            json=body,
            headers={
                "x-user-id": user["sub"],
                "x-user-role": user["role"]
            }
        )

    if resp.status_code >= 400:
        raise HTTPException(resp.status_code, resp.text)
    return resp.json()


# --------------------------------------------
# GET CLAIM HISTORY
# --------------------------------------------
@router.get("/history/user")
async def user_history(request: Request):
    user = decode_token(request)
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{CLAIM_SERVICE_URL}/claims/history/user",
            headers={
                "x-user-id": user["sub"],
                "x-user-role": user["role"]
            }
        )
    return resp.json()


@router.get("/history/admin")
async def admin_history(request: Request):
    user = decode_token(request)
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{CLAIM_SERVICE_URL}/claims/history/admin",
            headers={
                "x-user-id": user["sub"],
                "x-user-role": user["role"]
            }
        )
    return resp.json()



# --------------------------------------------
# GET SINGLE CLAIM
# --------------------------------------------
@router.get("/{claim_id}", summary="Get Single Claim (proxy)")
async def get_claim(claim_id: int, request: Request):
    user = decode_token(request)

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{CLAIM_SERVICE_URL}/claims/{claim_id}",
            headers={
                "x-user-id": user["sub"],
                "x-user-role": user["role"]
            }
        )

    if resp.status_code >= 400:
        raise HTTPException(resp.status_code, resp.text)
    return resp.json()


# --------------------------------------------
# UPDATE CLAIM
# --------------------------------------------
@router.put("/{claim_id}", summary="Update Claim (proxy)")
async def update_claim(claim_id: int, request: Request):
    user = decode_token(request)
    body = await request.json()

    async with httpx.AsyncClient() as client:
        resp = await client.put(
            f"{CLAIM_SERVICE_URL}/claims/{claim_id}",
            json=body,
            headers={
                "x-user-id": user["sub"],
                "x-user-role": user["role"]
            }
        )

    if resp.status_code >= 400:
        raise HTTPException(resp.status_code, resp.text)
    return resp.json()


# --------------------------------------------
# APPROVE CLAIM
# --------------------------------------------
@router.put("/{claim_id}/approve", summary="Approve Claim (proxy)")
async def approve_claim(claim_id: int, request: Request):
    user = decode_token(request)

    async with httpx.AsyncClient() as client:
        resp = await client.put(
            f"{CLAIM_SERVICE_URL}/claims/{claim_id}/approve",
            headers={
                "x-user-id": user["sub"],
                "x-user-role": user["role"]
            }
        )

    if resp.status_code >= 400:
        raise HTTPException(resp.status_code, resp.text)
    return resp.json()


# --------------------------------------------
# REJECT CLAIM
# --------------------------------------------
@router.put("/{claim_id}/reject", summary="Reject Claim (proxy)")
async def reject_claim(claim_id: int, request: Request):
    user = decode_token(request)

    async with httpx.AsyncClient() as client:
        resp = await client.put(
            f"{CLAIM_SERVICE_URL}/claims/{claim_id}/reject",
            headers={
                "x-user-id": user["sub"],
                "x-user-role": user["role"]
            }
        )

    if resp.status_code >= 400:
        raise HTTPException(resp.status_code, resp.text)
    return resp.json()
