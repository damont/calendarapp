from datetime import datetime

from beanie import Document, Indexed


class User(Document):
    username: Indexed(str, unique=True)
    email: Indexed(str, unique=True)
    hashed_password: str
    created_at: datetime
    updated_at: datetime

    class Settings:
        name = "users"
