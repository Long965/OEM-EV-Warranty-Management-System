from fastapi import FastAPI
from app.middleware.jwt_middleware import JWTMiddleware
from app.routes import auth_routes, user_routes

app = FastAPI(title="API Gateway")

app.add_middleware(JWTMiddleware)
app.include_router(auth_routes.router, prefix="/auth", tags=["Auth"])
app.include_router(user_routes.router, tags=["User"])

@app.get("/")
def root():
    return {"message": "Gateway running"}
