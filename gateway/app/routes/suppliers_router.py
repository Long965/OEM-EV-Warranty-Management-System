from fastapi import APIRouter, Request
from starlette.responses import Response
import os
from app.utils.proxy import proxy_request 

BASE_URL_BACKEND = os.environ.get("BACKEND_URL", "http://backend:8100") 

router = APIRouter(
    tags=["Suppliers"] 
    # Prefix "/suppliers" đã được định nghĩa trong main.py
)

@router.get("/")
async def list_suppliers(request: Request):
    # Proxy đến: GET http://backend:8100/suppliers/
    return await proxy_request(request, BASE_URL_BACKEND)

@router.post("/")
async def create_supplier(request: Request):
    # Proxy đến: POST http://backend:8100/suppliers/
    return await proxy_request(request, BASE_URL_BACKEND)

@router.get("/{supplier_id}") 
async def get_supplier(request: Request):
    # Proxy đến: GET http://backend:8100/suppliers/{supplier_id}
    return await proxy_request(request, BASE_URL_BACKEND)

@router.put("/{supplier_id}") 
async def update_supplier(request: Request):
    # Proxy đến: PUT http://backend:8100/suppliers/{supplier_id}
    return await proxy_request(request, BASE_URL_BACKEND)

@router.delete("/{supplier_id}") 
async def delete_supplier(request: Request):
    # Proxy đến: DELETE http://backend:8100/suppliers/{supplier_id}
    return await proxy_request(request, BASE_URL_BACKEND)