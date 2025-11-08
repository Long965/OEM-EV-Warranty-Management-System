from fastapi import FastAPI
from routes import upload_routes
from database import Base, engine

app = FastAPI(title="Warranty Upload Service", version="1.0")
Base.metadata.create_all(bind=engine)

app.include_router(upload_routes.router)

@app.get("/")
def root():
    return {"message": "Warranty Upload Service is running"}
