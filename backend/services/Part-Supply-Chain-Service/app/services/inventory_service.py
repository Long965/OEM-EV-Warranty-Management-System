# app/services/inventory_service.py
from sqlalchemy.orm import Session
from app.repositories.inventory_repo import InventoryRepository
from app.schemas.inventory_schema import InventoryCreate

class InventoryService:
    def __init__(self, db: Session):
        self.repo = InventoryRepository(db)

    def get_inventory(self, part_id: int, warehouse: str | None = None):
        return self.repo.get_by_part_and_warehouse(part_id, warehouse)

    def import_parts(self, payload: InventoryCreate):
        return self.repo.create_or_update(payload)

    def change_stock(self, part_id: int, delta: int, warehouse: str | None = None):
        return self.repo.adjust_quantity(part_id, delta, warehouse)
