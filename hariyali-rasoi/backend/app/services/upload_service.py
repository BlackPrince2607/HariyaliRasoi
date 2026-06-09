import uuid
from io import BytesIO
from functools import lru_cache
from fastapi import HTTPException, UploadFile
from PIL import Image
from supabase import create_client, Client
from app.config import settings

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_SIZE = 5 * 1024 * 1024  # 5MB


@lru_cache
def get_supabase() -> Client:
    return create_client(settings.supabase_url, settings.supabase_service_key)


async def validate_image(file: UploadFile) -> bytes:
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, and WebP images are allowed")

    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File size must be under 5MB")

    try:
        Image.open(BytesIO(content)).verify()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

    return content


async def upload_to_supabase(content: bytes, bucket: str, filename: str, content_type: str) -> str:
    path = f"{uuid.uuid4()}-{filename}"
    supabase = get_supabase()
    supabase.storage.from_(bucket).upload(
        path,
        content,
        {"content-type": content_type, "upsert": "false"},
    )
    public_url = supabase.storage.from_(bucket).get_public_url(path)
    return public_url
