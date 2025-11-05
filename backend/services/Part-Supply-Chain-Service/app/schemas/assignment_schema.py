# app/schemas/assignment_schema.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AssignmentBase(BaseModel):
    part_id: int
    assigned_to: str
    note: Optional[str] = None
    vin: Optional[str] = None

class AssignmentCreate(AssignmentBase):
    pass

class AssignmentUpdate(BaseModel):
    assigned_to: Optional[str]
    note: Optional[str]
    vin: Optional[str]

class AssignmentOut(AssignmentBase):
    id: int
    assigned_date: datetime

    class Config:
        orm_mode = True
