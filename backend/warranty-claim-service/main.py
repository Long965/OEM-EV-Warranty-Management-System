from fastapi import FastAPI
from routes import claim_routes
from database import Base, engine

app = FastAPI(title="Warranty Claim Service", version="1.0")

Base.metadata.create_all(bind=engine)

app.include_router(claim_routes.router)

@app.get("/")
def root():
    return {"message": "Warranty Claim Service is running"}