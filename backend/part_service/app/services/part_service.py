# app/services/part_service.py
from sqlalchemy.orm import Session
from app.repositories.part_repo import PartRepository
from app.schemas.part_schema import PartCreate, PartUpdate

class PartService:
    def __init__(self, db: Session):
        self.repo = PartRepository(db)

    def list_parts(self, skip=0, limit=100):
        return self.repo.list(skip=skip, limit=limit)

    def get_part(self, part_id: int):
        return self.repo.get(part_id)

    def create_part(self, payload: PartCreate):
        return self.repo.create(payload)

    def update_part(self, part_id: int, data: PartUpdate):
        part = self.repo.get(part_id)
        if not part:
            return None
        return self.repo.update(part, data)

    def delete_part(self, part_id: int):
        part = self.repo.get(part_id)
        if not part:
            return None
        return self.repo.delete(part)
