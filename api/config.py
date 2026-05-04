from functools import lru_cache
from typing import Optional

from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # MongoDB
    mongodb_url: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "calendarapp"

    # Auth
    jwt_secret: str = "change-this-secret-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7  # 1 week

    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8005

    # Frontend
    frontend_port: int = 8085
    frontend_base_url: str = "http://localhost:3000"

    # Google OAuth
    google_client_id: Optional[str] = None

    # SMTP (for password reset emails)
    smtp_email: str = ""
    smtp_app_password: str = ""
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    password_reset_expire_minutes: int = 60

    @field_validator("frontend_base_url")
    @classmethod
    def _ensure_scheme(cls, v: str) -> str:
        if v and not v.startswith(("http://", "https://")):
            return f"https://{v}"
        return v

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


@lru_cache
def get_settings() -> Settings:
    return Settings()
