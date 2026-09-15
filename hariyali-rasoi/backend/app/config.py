from pydantic_settings import BaseSettings
from pydantic import field_validator
import base64
import logging

logger = logging.getLogger(__name__)


def normalize_database_url(url: str) -> str:
    """Accept postgres:// or postgresql:// from dashboards; force asyncpg + ssl for Supabase."""
    url = url.strip()
    if url.startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://") :]
    if url.startswith("postgresql://"):
        url = "postgresql+asyncpg://" + url[len("postgresql://") :]
    elif not url.startswith("postgresql+asyncpg://"):
        raise ValueError(
            "DATABASE_URL must be a Postgres URL "
            "(postgresql+asyncpg://… or postgresql://…)"
        )
    # Supabase requires TLS; dashboards often omit the query string
    if "supabase.com" in url and "ssl=" not in url:
        url += ("&" if "?" in url else "?") + "ssl=require"
    return url


class Settings(BaseSettings):
    database_url: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    admin_email: str
    admin_password: str = ""
    # Optional: base64-encoded bcrypt hash (avoids Railway/Render `$` interpolation issues)
    admin_password_b64: str | None = None
    supabase_url: str
    supabase_service_key: str
    whatsapp_number: str
    app_url: str = "http://localhost:8000"
    cors_origins: str = "http://localhost:3000,https://hariyalirasoi.vercel.app,https://hariyalirasoi.com,https://www.hariyalirasoi.com"
    environment: str = "development"

    class Config:
        env_file = ".env"

    @field_validator("database_url", mode="before")
    @classmethod
    def _normalize_database_url(cls, v: object) -> object:
        if isinstance(v, str):
            return normalize_database_url(v)
        return v

    @property
    def is_production(self) -> bool:
        return self.environment.lower() in ("production", "prod")

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def resolved_admin_password_hash(self) -> str:
        if self.admin_password_b64:
            raw = self.admin_password_b64.strip()
            # If someone pasted the bcrypt hash into ADMIN_PASSWORD_B64 by mistake
            if raw.startswith(("$2a$", "$2b$", "$2y$")):
                return raw
            try:
                decoded = base64.b64decode(raw, validate=False).decode("utf-8")
            except (UnicodeDecodeError, ValueError) as exc:
                raise ValueError(
                    "ADMIN_PASSWORD_B64 is invalid. Encode the bcrypt hash with: "
                    "python scripts/encode_password_b64.py '$2b$12$...'"
                ) from exc
            return decoded
        return self.admin_password

    def validate_admin_password_config(self) -> None:
        try:
            pwd = self.resolved_admin_password_hash
        except ValueError as exc:
            logger.error("%s", exc)
            raise
        if not pwd:
            logger.warning("ADMIN_PASSWORD is not set — admin login disabled")
            return
        if not pwd.startswith(("$2a$", "$2b$", "$2y$")):
            logger.warning(
                "ADMIN_PASSWORD does not look like a bcrypt hash. "
                "Run: python scripts/hash_password.py <your-password> "
                "Or set ADMIN_PASSWORD_B64 via scripts/encode_password_b64.py"
            )


settings = Settings()
settings.validate_admin_password_config()
