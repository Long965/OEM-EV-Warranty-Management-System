# app/repositories/part_repo.py
from sqlalchemy.orm import Session
from app.models.part import Part
from app.schemas.part_schema import PartCreate, PartUpdate

class PartRepository:
    def __init__(self, db: Session):
        self.db = db

    def list(self, skip: int = 0, limit: int = 100):
        return self.db.query(Part).offset(skip).limit(limit).all()

    def get(self, part_id: int):
        return self.db.get(Part, part_id)

    def get_by_number(self, part_number: str):
        return self.db.query(Part).filter(Part.part_number == part_number).first()

    def create(self, payload: PartCreate):
        obj = Part(**payload.dict())
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def update(self, part: Part, data: PartUpdate):
        for k, v in data.dict(exclude_unset=True).items():
            setattr(part, k, v)
        self.db.commit()
        self.db.refresh(part)
        return part

    def delete(self, part: Part):
        self.db.delete(part)
        self.db.commit()
        return part
