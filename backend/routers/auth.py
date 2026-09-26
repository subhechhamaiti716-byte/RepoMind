from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User, AuditLog
from backend.schemas import UserRegister, UserLogin, TokenResponse, UserProfile
from backend.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )
    
    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Log audit
    audit = AuditLog(
        user_id=user.user_id,
        action="USER_REGISTER",
        entity_type="User",
        entity_id=user.user_id,
        details={"email": user.email}
    )
    db.add(audit)
    db.commit()

    return {
        "message": "User registered successfully",
        "user_id": user.user_id
    }

@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    token = create_access_token(data={"sub": user.user_id, "email": user.email})

    audit = AuditLog(
        user_id=user.user_id,
        action="USER_LOGIN",
        entity_type="User",
        entity_id=user.user_id
    )
    db.add(audit)
    db.commit()

    return {
        "access_token": token,
        "token_type": "Bearer",
        "expires_in": 3600,
        "user_id": user.user_id,
        "name": user.name,
        "email": user.email
    }

@router.get("/verify")
def verify_token(current_user: User = Depends(get_current_user)):
    return {
        "valid": True,
        "user_id": current_user.user_id,
        "email": current_user.email,
        "name": current_user.name
    }

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    return {"message": "Logged out successfully"}
