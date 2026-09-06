import os
import time
from fastapi import APIRouter, Depends, HTTPException
from ..auth import get_current_admin
import cloudinary.utils

router = APIRouter()

@router.get("/sign")
def sign_upload(admin: dict = Depends(get_current_admin)):
    api_secret = os.getenv("CLOUDINARY_API_SECRET")
    if not api_secret:
        raise HTTPException(status_code=500, detail="CLOUDINARY_API_SECRET is unset")
    timestamp = int(time.time())
    params = {"timestamp": timestamp}
    signature = cloudinary.utils.api_sign_request(
        params_to_sign=params,
        api_secret=api_secret
    )
    return {
        "signature": signature,
        "timestamp": timestamp,
        "apiKey": os.getenv("CLOUDINARY_API_KEY", ""),
        "cloudName": os.getenv("CLOUDINARY_CLOUD_NAME", "")
    }
