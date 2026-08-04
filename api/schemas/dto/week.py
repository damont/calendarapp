from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from api.schemas.orm.week import SportsEvent, WeekdayEvent, WeekendPlan


class WeekResponse(BaseModel):
    week_start: datetime
    week_end: datetime
    children_present: list[str]
    weekend_plans: list[WeekendPlan]
    weekday_events: list[WeekdayEvent]
    sports: list[SportsEvent]
    notes: Optional[str]
    has_html_page: bool = False
    html_page_updated_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class WeekUpdateRequest(BaseModel):
    children_present: Optional[list[str]] = None
    weekend_plans: Optional[list[WeekendPlan]] = None
    weekday_events: Optional[list[WeekdayEvent]] = None
    sports: Optional[list[SportsEvent]] = None
    notes: Optional[str] = None


class WeekHtmlPageResponse(BaseModel):
    week_start: datetime
    html: str
    updated_at: Optional[datetime] = None


class WeekHtmlPageUpdateRequest(BaseModel):
    html: str = Field(..., description="Full HTML document for the week's page")


class WeeksQueryParams(BaseModel):
    start_date: datetime = Field(..., description="Start date for the range")
    end_date: datetime = Field(..., description="End date for the range")
