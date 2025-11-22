from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.services.inventory_service import InventoryService
from app.services.alert_service import AlertService
from app.schemas.inventory_schema import InventoryCreate, InventoryOut, InventoryUpdate

router = APIRouter(tags=["Inventory"])

# ---------------------------
# LIST + ALERTS (STATIC PATH FIRST)
# ---------------------------

@router.get("/", response_model=List[InventoryOut])
def list_inventories(db: Session = Depends(get_db)):
    svc = InventoryService(db)
    return svc.list_all()

@router.get("/alerts")
def check_alerts(db: Session = Depends(get_db)):
    alert_svc = AlertService(db)
    return alert_svc.check_and_build_alerts()

# ---------------------------
# CRUD (DYNAMIC PATH BELOW)
# ---------------------------

@router.get("/{part_id}", response_model=InventoryOut)
def get_inventory(part_id: int, db: Session = Depends(get_db)):
    svc = InventoryService(db)
    inv = svc.get_inventory(part_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Inventory not found")
    return inv

@router.post("/", response_model=InventoryOut)
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

@router.put("/{inventory_id}", response_model=InventoryOut)
def update_inventory(inventory_id: int, payload: InventoryUpdate, db: Session = Depends(get_db)):
    svc = InventoryService(db)
    updated_inv = svc.update_inventory(inventory_id, payload)
    if not updated_inv:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return updated_inv

@router.delete("/{inventory_id}", response_model=InventoryOut)
def delete_inventory(inventory_id: int, db: Session = Depends(get_db)):
    svc = InventoryService(db)
    deleted_inv = svc.delete_inventory(inventory_id)
    if not deleted_inv:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return deleted_inv
