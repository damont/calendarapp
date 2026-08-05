from datetime import datetime
from typing import Optional

import pymongo
from beanie import Document, Indexed
from pydantic import BaseModel, Field, model_validator


class ChildGroup(BaseModel):
    id: str
    name: str
    abbreviation: str
    color: str


class UserSettings(BaseModel):
    """All user-configurable calendar settings stored in one embedded object."""

    child_groups: list[ChildGroup] = Field(default_factory=list)
    default_months_out: int = Field(default=3, ge=1, le=24)


def migrate_legacy_user_settings(values):
    """Move root-level child_groups into the embedded settings object."""
    if isinstance(values, dict) and "settings" not in values:
        values = dict(values)
        values["settings"] = {
            "child_groups": values.get("child_groups", []),
            "default_months_out": 3,
        }
    return values


class User(Document):
    username: Indexed(str, unique=True)
    email: Indexed(str, unique=True)
    hashed_password: Optional[str] = None
    display_name: Optional[str] = None
    settings: UserSettings = Field(default_factory=UserSettings)
    google_sub: Optional[str] = None
    email_verified: bool = True
    created_at: datetime
    updated_at: datetime

    @model_validator(mode="before")
    @classmethod
    def migrate_legacy_settings(cls, values):
        """Read existing users that stored child_groups at the document root."""
        return migrate_legacy_user_settings(values)

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
