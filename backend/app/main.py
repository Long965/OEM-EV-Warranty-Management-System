# app/main.py
from fastapi import FastAPI
from app.core.database import Base, engine
from app.routers import parts_router, inventory_router, suppliers_router, assignments_router
from sqlalchemy.exc import OperationalError
import time
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="Part Supply Chain Service - OEM EV Warranty", version="0.1.0")

# wait for DB on startup then create tables
@app.on_event("startup")
def on_startup():
    for i in range(30):  # retry ~30s
        try:
            conn = engine.connect()
            conn.close()
            break
        except OperationalError:
            time.sleep(1)
    # create tables after DB is reachable
    Base.metadata.create_all(bind=engine)

# Các nguồn gốc (origins) mà bạn cho phép truy cập
origins = [
    "http://localhost:3000",  # Frontend chạy trên máy host
    "http://frontend:3000",   # Frontend container chạy trong mạng Docker
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# include routers
app.include_router(parts_router, prefix="/parts", tags=["Parts"])
app.include_router(suppliers_router, prefix="/suppliers", tags=["Suppliers"])
app.include_router(inventory_router, prefix="/inventory", tags=["Inventory"])
app.include_router(assignments_router, prefix="/assignments", tags=["Assignments"])

@app.get("/")
def root():
    return {"message": "🚀 Warehouse Management API is running!"}
