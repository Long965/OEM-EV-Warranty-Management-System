from fastapi import APIRouter, HTTPException, Request, Query
import httpx
import os

# NO prefix here - will be added in main.py
router = APIRouter(tags=["Warranty Claim Gateway"])

CLAIM_SERVICE_URL = os.getenv("CLAIM_SERVICE_URL", "http://warranty-claim-service:8082")

@router.get("/", summary="List Claims (proxy)")
async def list_claims(role: str = Query("user"), user_id: str = Query("01")):
    """Proxy to claim service - list all claims with role-based filtering"""
    async with httpx.AsyncClient(follow_redirects=True) as client:
        resp = await client.get(
            f"{CLAIM_SERVICE_URL}/claims/",
            params={"role": role, "user_id": user_id}
        )

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
    """Proxy to claim service - create new claim"""
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

@router.get("/history", summary="Get Claim History (proxy)")
async def get_history(role: str = Query("user"), user_id: str = Query("01")):
    """Proxy to claim service - get claim history"""
    async with httpx.AsyncClient(follow_redirects=True) as client:
        resp = await client.get(
            f"{CLAIM_SERVICE_URL}/claims/history",
            params={"role": role, "user_id": user_id}
        )

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

@router.get("/{claim_id}", summary="Get Single Claim (proxy)")
async def get_claim(claim_id: int):
    """Proxy to claim service - get single claim details for editing"""
    async with httpx.AsyncClient(follow_redirects=True) as client:
        resp = await client.get(f"{CLAIM_SERVICE_URL}/claims/{claim_id}")

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

@router.put("/{claim_id}", summary="Update Claim (proxy)")
async def update_claim(claim_id: int, request: Request):
    """Proxy to claim service - update claim details"""
    data = await request.json()
    async with httpx.AsyncClient(follow_redirects=True) as client:
        resp = await client.put(
            f"{CLAIM_SERVICE_URL}/claims/{claim_id}",
            json=data
        )

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
    """Proxy to claim service - approve claim"""
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
    """Proxy to claim service - reject claim"""
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