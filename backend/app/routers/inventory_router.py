from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.services.inventory_service import InventoryService
from app.services.alert_service import AlertService
from app.schemas.inventory_schema import InventoryCreate, InventoryOut

router = APIRouter(prefix="/inventory", tags=["Inventory"])

@router.get("/", response_model=List[InventoryOut])
def list_inventories(db: Session = Depends(get_db)):
    svc = InventoryService(db)
    return svc.list_all()

@router.get("/{part_id}", response_model=InventoryOut)
def get_inventory(part_id: int, db: Session = Depends(get_db)):
    svc = InventoryService(db)
    inv = svc.get_inventory(part_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Inventory not found")
    return inv

@router.post("/import", response_model=InventoryOut)
def import_parts(payload: InventoryCreate, db: Session = Depends(get_db)):
    svc = InventoryService(db)
    return svc.import_parts(payload)

@router.post("/adjust/{part_id}", response_model=InventoryOut)
def adjust_stock(part_id: int, delta: int, warehouse: str | None = None, db: Session = Depends(get_db)):
    svc = InventoryService(db)
    try:
        return svc.change_stock(part_id, delta, warehouse)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/alerts")
def check_alerts(db: Session = Depends(get_db)):
    alert_svc = AlertService(db)
    return alert_svc.check_and_build_alerts()
