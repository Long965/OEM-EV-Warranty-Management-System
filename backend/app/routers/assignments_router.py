# app/routers/assignments_router.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.assignment_schema import AssignmentOut, AssignmentCreate, AssignmentUpdate
from app.services.assignment_service import AssignmentService
from typing import List

router = APIRouter(prefix="/assignments", tags=["Assignments"])

@router.get("/", response_model=List[AssignmentOut])
def list_assignments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    svc = AssignmentService(db)
    return svc.list_assignments(skip, limit)

@router.get("/{assignment_id}", response_model=AssignmentOut)
def get_assignment(assignment_id: int, db: Session = Depends(get_db)):
    svc = AssignmentService(db)
    assignment = svc.get_assignment(assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return assignment

@router.post("/", response_model=AssignmentOut)
def create_assignment(payload: AssignmentCreate, db: Session = Depends(get_db)):
    svc = AssignmentService(db)
    return svc.create_assignment(payload)

@router.put("/{assignment_id}", response_model=AssignmentOut)
def update_assignment(assignment_id: int, payload: AssignmentUpdate, db: Session = Depends(get_db)):
    svc = AssignmentService(db)
    updated = svc.update_assignment(assignment_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return updated

@router.delete("/{assignment_id}")
def delete_assignment(assignment_id: int, db: Session = Depends(get_db)):
    svc = AssignmentService(db)
    success = svc.delete_assignment(assignment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return {"message": "Assignment deleted successfully"}
