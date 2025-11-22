# app/schemas/distribution_schema.py
from pydantic import BaseModel

class DistributionCreate(BaseModel):
    request_id: int | None = None
    part_id: int
    center_id: int
    quantity: int

class DistributionOut(DistributionCreate):
    id: int
    class Config:
        orm_mode = True
