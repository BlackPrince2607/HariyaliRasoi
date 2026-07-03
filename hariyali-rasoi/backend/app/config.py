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
    cors_origins: str = "http://localhost:3000,https://hariyalirasoi.vercel.app,https://hariyalirasoi.com,https://www.hariyalirasoi.com"
    environment: str = "development"

    class Config:
        env_file = ".env"

    @property
    def is_production(self) -> bool:
        return self.environment.lower() in ("production", "prod")

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
