# app/routers/suppliers_router.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.supplier import Supplier
from app.schemas.supplier_schema import SupplierCreate, SupplierOut

router = APIRouter()

@router.post("/", response_model=SupplierOut)
def create_supplier(payload: SupplierCreate, db: Session = Depends(get_db)):
    s = Supplier(**payload.dict())
    db.add(s)
    db.commit()
    db.refresh(s)
    return s

@router.get("/", response_model=List[SupplierOut])
def list_suppliers(db: Session = Depends(get_db)):
    return db.query(Supplier).all()
