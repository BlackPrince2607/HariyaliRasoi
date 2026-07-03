from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings as app_settings
from app.startup import seed_menu_if_empty, sync_store_contact_from_env
from app.routers import (
    auth,
    menu,
    categories,
    orders,
    coupons,
    reviews,
    banners,
    gallery,
    store,
    upload,
    inquiries,
    analytics,
)

@asynccontextmanager
async def lifespan(_: FastAPI):
    await seed_menu_if_empty()
    await sync_store_contact_from_env()
    yield


app = FastAPI(
    title="Hariyali Rasoi API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url=None if app_settings.is_production else "/docs",
    redoc_url=None if app_settings.is_production else "/redoc",
    openapi_url=None if app_settings.is_production else "/openapi.json",
)

# Fixed origins + regex for LAN dev (phone at http://192.168.x.x:3000)
_LAN_ORIGIN_REGEX = r"https?://(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?$"

app.add_middleware(
    CORSMiddleware,
    allow_origins=app_settings.cors_origin_list,
    allow_origin_regex=_LAN_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(menu.router, prefix="/api/menu", tags=["menu"])
app.include_router(categories.router, prefix="/api/categories", tags=["categories"])
app.include_router(orders.router, prefix="/api/orders", tags=["orders"])
app.include_router(coupons.router, prefix="/api/coupons", tags=["coupons"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["reviews"])
app.include_router(banners.router, prefix="/api/banners", tags=["banners"])
app.include_router(gallery.router, prefix="/api/gallery", tags=["gallery"])
app.include_router(store.router, prefix="/api/store", tags=["store"])
app.include_router(upload.router, prefix="/api/upload", tags=["upload"])
app.include_router(inquiries.router, prefix="/api/inquiries", tags=["inquiries"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])


@app.get("/health")
async def health():
    return {"status": "ok"}
