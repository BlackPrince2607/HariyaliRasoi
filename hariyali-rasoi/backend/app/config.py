from pydantic_settings import BaseSettings
import base64
import logging

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    database_url: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    admin_email: str
    admin_password: str = ""
    # Optional: base64-encoded bcrypt hash (avoids Railway `$` interpolation issues)
    admin_password_b64: str | None = None
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

    @property
    def resolved_admin_password_hash(self) -> str:
        if self.admin_password_b64:
            return base64.b64decode(self.admin_password_b64).decode("utf-8")
        return self.admin_password

    def validate_admin_password_config(self) -> None:
        pwd = self.resolved_admin_password_hash
        if not pwd:
            logger.warning("ADMIN_PASSWORD is not set — admin login disabled")
            return
        if not pwd.startswith(("$2a$", "$2b$", "$2y$")):
            logger.warning(
                "ADMIN_PASSWORD does not look like a bcrypt hash. "
                "Run: python scripts/hash_password.py <your-password> "
                "Or set ADMIN_PASSWORD_B64 to avoid Railway `$` issues."
            )


settings = Settings()
settings.validate_admin_password_config()
