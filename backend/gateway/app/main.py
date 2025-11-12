from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.middleware.jwt_middleware import JWTMiddleware
from app.routes import auth_routes, user_routes, claim_routes, upload_routes

app = FastAPI(title="OEM EV Warranty Gateway")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        
    allow_credentials=True,     
    allow_methods=["*"],        
    allow_headers=["*"],        
)
app.add_middleware(JWTMiddleware)

app.include_router(auth_routes.router, prefix="/auth", tags=["Auth"])
app.include_router(user_routes.router, tags=["User"])
app.include_router(claim_routes.router, prefix="/claims")
app.include_router(upload_routes.router, prefix="/uploads")

@app.get("/")
def root():
    return {"message": "Gateway running"}
