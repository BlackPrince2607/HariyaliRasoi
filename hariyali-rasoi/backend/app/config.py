from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    admin_email: str
    admin_password: str
    supabase_url: str
    supabase_service_key: str
    whatsapp_number: str
    app_url: str = "http://localhost:8000"

    class Config:
        env_file = ".env"


settings = Settings()
