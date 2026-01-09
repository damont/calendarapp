from datetime import timedelta
from typing import Optional

from api.config import settings
from api.utils.auth import create_access_token


def authenticate(password: str) -> Optional[str]:
    """
    Authenticate with the app password.
    Returns a JWT token if successful, None otherwise.
    """
    if password == settings.app_password:
        token = create_access_token(
            data={"sub": "family"},
            expires_delta=timedelta(minutes=settings.jwt_expire_minutes),
        )
        return token
    return None
