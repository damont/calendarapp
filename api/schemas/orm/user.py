from datetime import datetime
from typing import Optional

import pymongo
from beanie import Document, Indexed
from pydantic import BaseModel, Field


class ChildGroup(BaseModel):
    id: str
    name: str
    abbreviation: str
    color: str


class User(Document):
    username: Indexed(str, unique=True)
    email: Indexed(str, unique=True)
    hashed_password: Optional[str] = None
    display_name: Optional[str] = None
    child_groups: list[ChildGroup] = Field(default_factory=list)
    google_sub: Optional[str] = None
    email_verified: bool = True
    created_at: datetime
    updated_at: datetime

    class Settings:
        name = "users"
        indexes = [
            pymongo.IndexModel(
                [("google_sub", pymongo.ASCENDING)],
                unique=True,
                sparse=True,
                name="google_sub_unique_sparse",
            ),
        ]
