from fastapi import APIRouter, Depends, File, Form, UploadFile

from app.dependencies import get_current_admin
from app.schemas.auth import AdminUser
from app.services.upload_service import upload_to_supabase, validate_image

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
