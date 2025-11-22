# app/schemas/request_schema.py
from pydantic import BaseModel
from typing import Optional
from enum import Enum

class RequestCreate(BaseModel):
    center_id: int
    part_id: int
    quantity: int

class RequestOut(RequestCreate):
    id: int
    status: str
    class Config:
        orm_mode = True
