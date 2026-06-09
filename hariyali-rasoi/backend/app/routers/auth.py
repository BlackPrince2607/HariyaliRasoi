from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from app.schemas.auth import TokenResponse, AdminUser
from app.services.auth_service import authenticate_admin
from app.dependencies import get_current_admin

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    token = authenticate_admin(form_data.username, form_data.password)
    if not token:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return TokenResponse(access_token=token)


@router.get("/me", response_model=AdminUser)
async def get_me(admin: AdminUser = Depends(get_current_admin)):
    return admin
