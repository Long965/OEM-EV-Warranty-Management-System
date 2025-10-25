from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from . import db, models, schemas

app = FastAPI(title="User Service")

@app.get("/profile/{user_id}", response_model=schemas.UserProfileOut)
def get_profile(user_id: int, db: Session = Depends(db.get_db)):
    profile = db.query(models.UserProfile).filter_by(user_id=user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile
