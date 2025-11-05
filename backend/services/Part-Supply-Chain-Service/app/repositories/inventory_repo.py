# app/repositories/inventory_repo.py
from sqlalchemy.orm import Session
from app.models.inventory import Inventory
from app.schemas.inventory_schema import InventoryCreate

class InventoryRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_part_and_warehouse(self, part_id: int, warehouse: str | None = None):
        q = self.db.query(Inventory).filter(Inventory.part_id == part_id)
        if warehouse:
            q = q.filter(Inventory.warehouse == warehouse)
        return q.first()

    def create_or_update(self, payload: InventoryCreate):
        inv = self.get_by_part_and_warehouse(payload.part_id, payload.warehouse)
        if inv:
            inv.quantity = payload.quantity
            inv.min_threshold = payload.min_threshold
        else:
            inv = Inventory(**payload.dict())
            self.db.add(inv)
        self.db.commit()
        self.db.refresh(inv)
        return inv

    def adjust_quantity(self, part_id: int, delta: int, warehouse: str | None = None):
        inv = self.get_by_part_and_warehouse(part_id, warehouse)
        if not inv:
            inv = Inventory(part_id=part_id, warehouse=warehouse or "default", quantity=0)
            self.db.add(inv)
        inv.quantity += delta
        self.db.commit()
        self.db.refresh(inv)
        return inv
