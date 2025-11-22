# app/repositories/assignment_repo.py
from sqlalchemy.orm import Session
from app.models.assignment import Assignment
from app.schemas.assignment_schema import AssignmentCreate, AssignmentUpdate

class AssignmentRepository:
    def __init__(self, db: Session):
        self.db = db

    def list(self, skip=0, limit=100):
        return self.db.query(Assignment).offset(skip).limit(limit).all()

    def get(self, assignment_id: int):
        return self.db.query(Assignment).filter(Assignment.id == assignment_id).first()

    def create(self, payload: AssignmentCreate):
        obj = Assignment(**payload.dict())
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def update(self, assignment: Assignment, data: AssignmentUpdate):
        for k, v in data.dict(exclude_unset=True).items():
            setattr(assignment, k, v)
        self.db.commit()
        self.db.refresh(assignment)
        return assignment

    def delete(self, assignment: Assignment):
        self.db.delete(assignment)
        self.db.commit()
