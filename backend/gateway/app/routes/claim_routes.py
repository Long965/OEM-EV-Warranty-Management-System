from fastapi import APIRouter, HTTPException, Request
import httpx
import os

router = APIRouter(tags=["Warranty Claim"])

CLAIM_SERVICE_URL = os.getenv("CLAIM_SERVICE_URL", "http://warranty-claim-service:8082")

@router.get("/", summary="List Claims (proxy)")
async def list_claims():
    async with httpx.AsyncClient(follow_redirects=True) as client:
        resp = await client.get(f"{CLAIM_SERVICE_URL}/claims/")

    if resp.status_code >= 400:
        raise HTTPException(
            status_code=resp.status_code,
            detail=f"Claim Service Error: {resp.text}"
        )

    try:
        return resp.json()
    except Exception:
        raise HTTPException(
            status_code=500,
            detail=f"Claim Service returned non-JSON: {resp.text}"
        )

@router.post("/", summary="Create Claim (proxy)")
async def create_claim(request: Request):
    data = await request.json()
    async with httpx.AsyncClient(follow_redirects=True) as client:
        resp = await client.post(f"{CLAIM_SERVICE_URL}/claims/", json=data)

    if resp.status_code >= 400:
        raise HTTPException(
            status_code=resp.status_code,
            detail=f"Claim Service Error: {resp.text}"
        )

    try:
        return resp.json()
    except Exception:
        raise HTTPException(
            status_code=500,
            detail=f"Claim Service returned non-JSON: {resp.text}"
        )

@router.put("/{claim_id}/approve", summary="Approve Claim (proxy)")
async def approve_claim(claim_id: int):
    async with httpx.AsyncClient(follow_redirects=True) as client:
        resp = await client.put(f"{CLAIM_SERVICE_URL}/claims/{claim_id}/approve")

    if resp.status_code >= 400:
        raise HTTPException(
            status_code=resp.status_code,
            detail=f"Claim Service Error: {resp.text}"
        )

    try:
        return resp.json()
    except Exception:
        raise HTTPException(
            status_code=500,
            detail=f"Claim Service returned non-JSON: {resp.text}"
        )

@router.put("/{claim_id}/reject", summary="Reject Claim (proxy)")
async def reject_claim(claim_id: int):
    async with httpx.AsyncClient(follow_redirects=True) as client:
        resp = await client.put(f"{CLAIM_SERVICE_URL}/claims/{claim_id}/reject")

    if resp.status_code >= 400:
        raise HTTPException(
            status_code=resp.status_code,
            detail=f"Claim Service Error: {resp.text}"
        )

    try:
        return resp.json()
    except Exception:
        raise HTTPException(
            status_code=500,
            detail=f"Claim Service returned non-JSON: {resp.text}"
        )
