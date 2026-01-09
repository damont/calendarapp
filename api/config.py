from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # MongoDB
    mongodb_url: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "calendarapp"

    # Auth
    app_password: str = "changeme"
    jwt_secret: str = "change-this-secret-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7  # 1 week

    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8005

    # Frontend
    frontend_port: int = 8085

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }


settings = Settings()
