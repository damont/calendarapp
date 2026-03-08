from datetime import datetime
from typing import Optional

from beanie import Document, Indexed
from pydantic import BaseModel, Field


class WeekendPlan(BaseModel):
    title: str
    description: Optional[str] = None
    day: str  # "saturday" or "sunday"
    time: Optional[str] = None


class WeekdayEvent(BaseModel):
    title: str
    description: Optional[str] = None
    day: str  # "monday", "tuesday", "wednesday", "thursday", "friday"
    time: Optional[str] = None


class SportsEvent(BaseModel):
    child_name: str
    sport: str
    day: str
    time: str
    location: str


class Week(Document):
    week_start: datetime = Field(..., description="Monday of the week")
    week_end: datetime = Field(..., description="Sunday of the week")
    user_id: Indexed(str) = Field(..., description="Owner user ID")

    # Children present this week (list of child group IDs)
    children_present: list[str] = Field(default_factory=list)

    # Plans and events
    weekend_plans: list[WeekendPlan] = Field(default_factory=list)
    weekday_events: list[WeekdayEvent] = Field(default_factory=list)
    sports: list[SportsEvent] = Field(default_factory=list)

    # Notes
    notes: Optional[str] = None

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "weeks"
        indexes = [
            "week_start",
        ]
