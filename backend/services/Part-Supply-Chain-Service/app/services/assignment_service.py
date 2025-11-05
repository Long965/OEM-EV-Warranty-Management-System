# app/services/assignment_service.py
from app.repositories.assignment_repo import AssignmentRepository
from app.schemas.assignment_schema import AssignmentCreate, AssignmentUpdate
from app.models.assignment import Assignment

class AssignmentService:
    def __init__(self, db):
        self.repo = AssignmentRepository(db)

    def list_assignments(self, skip=0, limit=100):
        return self.repo.list(skip, limit)

    def get_assignment(self, assignment_id: int):
        return self.repo.get(assignment_id)

    def create_assignment(self, payload: AssignmentCreate):
        return self.repo.create(payload)

    def update_assignment(self, assignment_id: int, payload: AssignmentUpdate):
        assignment = self.repo.get(assignment_id)
        if not assignment:
            return None
        return self.repo.update(assignment, payload)

    def delete_assignment(self, assignment_id: int):
        assignment = self.repo.get(assignment_id)
        if assignment:
            self.repo.delete(assignment)
            return True
        return False
