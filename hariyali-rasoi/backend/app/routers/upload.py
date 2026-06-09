from fastapi import APIRouter, Depends, UploadFile, File, Form
from app.dependencies import get_current_admin
from app.schemas.auth import AdminUser
from app.services.upload_service import validate_image, upload_to_supabase

router = APIRouter()


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    bucket: str = Form("menu"),
    _: AdminUser = Depends(get_current_admin),
):
    allowed_buckets = {"menu", "banners", "gallery", "upi"}
    if bucket not in allowed_buckets:
        bucket = "menu"
    content = await validate_image(file)
    url = await upload_to_supabase(
        content, bucket, file.filename or "image.jpg", file.content_type or "image/jpeg"
    )
    return {"url": url}


@router.post("/payment")
async def upload_payment(file: UploadFile = File(...)):
    content = await validate_image(file)
    url = await upload_to_supabase(
        content, "payments", file.filename or "payment.jpg", file.content_type or "image/jpeg"
    )
    return {"url": url}
