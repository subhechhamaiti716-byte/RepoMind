from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User
from backend.schemas import UserProfile
from backend.auth import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserProfile)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me")
def update_me(payload: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if "name" in payload and payload["name"]:
        current_user.name = payload["name"]
        db.commit()
    return {"message": "Profile updated successfully"}
