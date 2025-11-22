from sqlalchemy.orm import Session
from app.models.inventory import Inventory
from app.schemas.inventory_schema import InventoryCreate, InventoryUpdate

class InventoryRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_all(self):
        return self.db.query(Inventory).all()

    def get_by_part_and_warehouse(self, part_id: int, warehouse: str | None = None):
        query = self.db.query(Inventory).filter(Inventory.part_id == part_id)
        if warehouse:
            query = query.filter(Inventory.warehouse == warehouse)
        return query.first()

    def create_or_update(self, payload: InventoryCreate):
        inv = self.get_by_part_and_warehouse(payload.part_id, payload.warehouse)
        if inv:
            inv.quantity += payload.quantity
        else:
            inv = Inventory(
                part_id=payload.part_id,
                warehouse=payload.warehouse,
                quantity=payload.quantity,
                min_threshold=payload.min_threshold,
            )
            self.db.add(inv)
        self.db.commit()
        self.db.refresh(inv)
        return inv

    def adjust_quantity(self, part_id: int, delta: int, warehouse: str | None = None):
        inv = self.get_by_part_and_warehouse(part_id, warehouse)
        if not inv:
            raise ValueError("Inventory not found for this part and warehouse")
        inv.quantity += delta
        if inv.quantity < 0:
            inv.quantity = 0
        self.db.commit()
        self.db.refresh(inv)
        return inv
    
    def update(self, inventory_id: int, data: InventoryUpdate):
        inv = self.db.query(Inventory).filter(Inventory.id == inventory_id).first()
        if not inv:
            return None
        for k, v in data.dict(exclude_unset=True).items():
            setattr(inv, k, v)
        self.db.commit()
        self.db.refresh(inv)
        return inv
    
    def delete(self, inventory_id: int):
        inv = self.db.query(Inventory).filter(Inventory.id == inventory_id).first()
        if not inv:
            return None
        self.db.delete(inv)
        self.db.commit()
        return inv  
    

