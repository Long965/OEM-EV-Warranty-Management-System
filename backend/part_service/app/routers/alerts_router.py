# app/routers/alerts_router.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.part import Part
from app.models.inventory import Inventory

router = APIRouter()

@router.get("/", tags=["Alerts"])
def low_stock_alerts(db: Session = Depends(get_db)):
    """
    Trả về danh sách phụ tùng có số lượng tồn kho < 5
    """
    low_stock = (
        db.query(Part.name, Inventory.quantity)
        .join(Inventory, Part.id == Inventory.part_id)
        .filter(Inventory.quantity < 5)
        .all()
    )
    return [
        {"part_name": name, "quantity": qty}
        for name, qty in low_stock
    ]
