from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from fastapi.openapi.models import SecuritySchemeType
from app.routes import auth_routes, report_routes
from app.middleware.auth_middleware import AuthMiddleware
from app.middleware.logging_middleware import LoggingMiddleware 


app = FastAPI(title="EV Warranty - API Gateway")
app.add_middleware(LoggingMiddleware)


# CORS - chỉnh theo nhu cầu
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # production: chỉ cho domain của frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware: kiểm tra JWT trước khi route đến service (trừ các exempt routes)
app.add_middleware(AuthMiddleware, exempt_paths=["/auth/login", "/auth/register", "/"])

app.include_router(auth_routes.router, prefix="/auth", tags=["Auth"])
app.include_router(report_routes.router, prefix="/report", tags=["Report"])

@app.get("/")
async def root():
    return {"message": "Welcome to EV Warranty API Gateway"}

@app.get("/health")
async def health():
    return {"status": "ok", "gateway": True}


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title,
        version="1.0.0",
        description="Gateway forwarding requests to Auth and Report services",
        routes=app.routes,
    )

    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",             # <-- Dùng chuỗi 'http' thay vì SecuritySchemeType.http
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }

    # Áp dụng BearerAuth cho toàn bộ endpoint
    for path in openapi_schema["paths"].values():
        for method in path.values():
            method["security"] = [{"BearerAuth": []}]

    app.openapi_schema = openapi_schema
    return app.openapi_schema