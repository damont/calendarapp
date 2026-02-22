from datetime import datetime

from fastapi import APIRouter, Depends, Query

from api.schemas.dto.week import WeekResponse, WeekUpdateRequest
from api.schemas.orm.user import User
from api.services import weeks as weeks_service
from api.utils.auth import get_current_user

router = APIRouter(prefix="/weeks", tags=["weeks"])


@router.get("", response_model=list[WeekResponse])
async def get_weeks(
    start_date: datetime = Query(..., description="Start date for the range"),
    end_date: datetime = Query(..., description="End date for the range"),
    user: User = Depends(get_current_user),
):
    """Get all weeks in a date range, auto-creating any that don't exist."""
    weeks = await weeks_service.get_weeks_by_range(start_date, end_date, str(user.id))
    return [WeekResponse.model_validate(w) for w in weeks]


@router.get("/{week_start}", response_model=WeekResponse)
async def get_week(
    week_start: datetime,
    user: User = Depends(get_current_user),
):
    """Get a single week by its start date, auto-creating if it doesn't exist."""
    week = await weeks_service.get_or_create_week(week_start, str(user.id))
    return WeekResponse.model_validate(week)


@router.put("/{week_start}", response_model=WeekResponse)
async def update_week(
    week_start: datetime,
    update_data: WeekUpdateRequest,
    user: User = Depends(get_current_user),
):
    """Update a week's fields."""
    week = await weeks_service.update_week(week_start, update_data, str(user.id))
    return WeekResponse.model_validate(week)


@router.delete("/{week_start}")
async def delete_week(
    week_start: datetime,
    user: User = Depends(get_current_user),
):
    """Delete a week (it will be recreated with defaults on next access)."""
    deleted = await weeks_service.delete_week(week_start, str(user.id))
    return {"deleted": deleted}
