import os
from fastapi import APIRouter, HTTPException, Depends
from models import LoginRequest
from auth import verify_password, create_access_token, get_current_admin

router = APIRouter()

@router.post("/login")
def login(req: LoginRequest):
    hashed_password = os.getenv("ADMIN_PASSWORD_HASH")
    if not hashed_password:
        raise HTTPException(status_code=500, detail="Server config error")
    if verify_password(req.password, hashed_password):
        token = create_access_token({"sub": "admin"})
        return {"token": token, "expiresIn": 86400}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@router.get("/verify")
def verify(current_admin: dict = Depends(get_current_admin)):
    return {"valid": True, "user": "admin"}
