# app/routers/parts_router.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.services.part_service import PartService
from app.schemas.part_schema import PartCreate, PartOut, PartUpdate

router = APIRouter()

@router.get("/", response_model=List[PartOut])
def list_parts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    svc = PartService(db)
    return svc.list_parts(skip=skip, limit=limit)

@router.post("/", response_model=PartOut)
def create_part(payload: PartCreate, db: Session = Depends(get_db)):
    svc = PartService(db)
    return svc.create_part(payload)

@router.get("/{part_id}", response_model=PartOut)
def get_part(part_id: int, db: Session = Depends(get_db)):
    svc = PartService(db)
    p = svc.get_part(part_id)
    if not p:
        raise HTTPException(status_code=404, detail="Part not found")
    return p

@router.put("/{part_id}", response_model=PartOut)
def update_part(part_id: int, payload: PartUpdate, db: Session = Depends(get_db)):
    svc = PartService(db)
    p = svc.update_part(part_id, payload)
    if not p:
        raise HTTPException(status_code=404, detail="Part not found")
    return p

@router.delete("/{part_id}", response_model=PartOut)
def delete_part(part_id: int, db: Session = Depends(get_db)):
    svc = PartService(db)
    p = svc.delete_part(part_id)
    if not p:
        raise HTTPException(status_code=404, detail="Part not found")
    return p
