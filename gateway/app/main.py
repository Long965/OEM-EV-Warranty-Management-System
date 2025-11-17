from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer 

from app.middleware.logging_middleware import LoggingMiddleware
from app.middleware.auth_middleware import AuthMiddleware

from app.routes.parts_router import router as parts_router
from app.routes.inventory_router import router as inventory_router
from app.routes.suppliers_router import router as suppliers_router
from app.routes.alerts_router import router as alerts_router
from app.routes.assignments_router import router as assignments_router
from app.routes.auth_router import router as auth_router

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

security_scheme = {
    "BearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
        "description": "Nhập JWT token dạng: Bearer <token>"
    }
}

app = FastAPI(
    title="Microservice API Gateway",
    version="0.1.0",
    openapi_extra={
        "components": {
            "securitySchemes": security_scheme
        }
    }
)

# Logging middleware
app.add_middleware(LoggingMiddleware)

# CORS
origins = ["http://localhost", "http://localhost:3000", "http://localhost:8000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth Middleware
exempt_paths = [
    "/",               # home
    "/docs",           
    "/openapi.json",
    "/auth/login",     # CHO PHÉP LOGIN
    "/auth/register"   # CHO PHÉP REGISTER
]
app.add_middleware(AuthMiddleware, exempt_paths=exempt_paths)

# Routers
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(parts_router, prefix="/parts", tags=["Parts (Admin Only)"])
app.include_router(suppliers_router, prefix="/suppliers", tags=["Suppliers (Admin Only)"])
app.include_router(inventory_router, prefix="/inventory", tags=["Inventory (Admin Only)"])
app.include_router(assignments_router, prefix="/assignments", tags=["Assignments (Admin Only)"])
app.include_router(alerts_router, prefix="/alerts", tags=["Alerts (Admin Only)"])

@app.get("/")
def root():
    return {"status": "API Gateway running"}
