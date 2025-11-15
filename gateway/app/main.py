# gateway/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.parts_router import router as parts_router
from app.routes.suppliers_router import router as suppliers_router
from app.routes.inventory_router import router as inventory_router
from app.routes.assignments_router import router as assignments_router
from app.routes.alerts_router import router as alerts_router

app = FastAPI(title="Microservice API Gateway")

origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ CẤU HÌNH NÀY SẼ HOẠT ĐỘNG
# Gateway sẽ lắng nghe trên /parts/
app.include_router(parts_router, prefix="/parts", tags=["Parts"]) 
app.include_router(suppliers_router, prefix="/suppliers", tags=["Suppliers"])
app.include_router(inventory_router, prefix="/inventory", tags=["Inventory"])
app.include_router(assignments_router, prefix="/assignments", tags=["Assignments"])
app.include_router(alerts_router, prefix="/alerts", tags=["Alerts"])

@app.get("/")
def root():
    return {"status": "API Gateway running"}