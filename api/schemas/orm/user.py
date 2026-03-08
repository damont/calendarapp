from datetime import datetime
from typing import Optional

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
    hashed_password: str
    child_groups: list[ChildGroup] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    class Settings:
        name = "users"
