from datetime import datetime

from fastapi import APIRouter, Depends, Query

from api.routes.auth import get_current_user
from api.schemas.dto.week import WeekResponse, WeekUpdateRequest
from api.services import weeks as weeks_service

router = APIRouter(prefix="/weeks", tags=["weeks"])


@router.get("", response_model=list[WeekResponse])
async def get_weeks(
    start_date: datetime = Query(..., description="Start date for the range"),
    end_date: datetime = Query(..., description="End date for the range"),
    _: dict = Depends(get_current_user),
):
    """Get all weeks in a date range, auto-creating any that don't exist."""
    weeks = await weeks_service.get_weeks_by_range(start_date, end_date)
    return [WeekResponse.model_validate(w) for w in weeks]


@router.get("/{week_start}", response_model=WeekResponse)
async def get_week(
    week_start: datetime,
    _: dict = Depends(get_current_user),
):
    """Get a single week by its start date, auto-creating if it doesn't exist."""
    week = await weeks_service.get_or_create_week(week_start)
    return WeekResponse.model_validate(week)


@router.put("/{week_start}", response_model=WeekResponse)
async def update_week(
    week_start: datetime,
    update_data: WeekUpdateRequest,
    _: dict = Depends(get_current_user),
):
    """Update a week's fields."""
    week = await weeks_service.update_week(week_start, update_data)
    return WeekResponse.model_validate(week)


@router.delete("/{week_start}")
async def delete_week(
    week_start: datetime,
    _: dict = Depends(get_current_user),
):
    """Delete a week (it will be recreated with defaults on next access)."""
    deleted = await weeks_service.delete_week(week_start)
    return {"deleted": deleted}
