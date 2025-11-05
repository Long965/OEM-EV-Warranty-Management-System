# app/main.py
from fastapi import FastAPI
from app.core.database import Base, engine
from app.routers import parts_router, inventory_router, suppliers_router, assignments_router

# create all tables (for dev). In production use migrations (Alembic).
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Part Supply Chain Service - OEM EV Warranty", version="0.1.0")

# include routers
app.include_router(parts_router.router, prefix="/parts", tags=["Parts"])
app.include_router(inventory_router.router, prefix="/inventory", tags=["Inventory"])
app.include_router(suppliers_router.router, prefix="/suppliers", tags=["Suppliers"])
app.include_router(assignments_router.router)

@app.get("/")
def root():
    return {"message": "🚀 Warehouse Management API is running!"}
