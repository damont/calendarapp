from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status

from api.schemas.dto.week import (
    WeekHtmlPageResponse,
    WeekHtmlPageUpdateRequest,
    WeekResponse,
    WeekUpdateRequest,
)
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


@router.get("/{week_start}/page", response_model=WeekHtmlPageResponse)
async def get_week_page(
    week_start: datetime,
    user: User = Depends(get_current_user),
):
    """Get the HTML page for a week. 404 if the week has no page."""
    week = await weeks_service.get_or_create_week(week_start, str(user.id))

    if not week.has_html_page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="This week has no HTML page",
        )

    return WeekHtmlPageResponse(
        week_start=week.week_start,
        html=week.html_page,
        updated_at=week.html_page_updated_at,
    )


@router.put("/{week_start}/page", response_model=WeekHtmlPageResponse)
async def update_week_page(
    week_start: datetime,
    page_data: WeekHtmlPageUpdateRequest,
    user: User = Depends(get_current_user),
):
    """Create or replace the HTML page for a week."""
    week = await weeks_service.set_week_html_page(
        week_start, page_data.html, str(user.id)
    )
    return WeekHtmlPageResponse(
        week_start=week.week_start,
        html=week.html_page,
        updated_at=week.html_page_updated_at,
    )


@router.delete("/{week_start}/page")
async def delete_week_page(
    week_start: datetime,
    user: User = Depends(get_current_user),
):
    """Remove a week's HTML page, leaving the rest of the week intact."""
    deleted = await weeks_service.delete_week_html_page(week_start, str(user.id))
    return {"deleted": deleted}


@router.delete("/{week_start}")
async def delete_week(
    week_start: datetime,
    user: User = Depends(get_current_user),
):
    """Delete a week (it will be recreated with defaults on next access)."""
    deleted = await weeks_service.delete_week(week_start, str(user.id))
    return {"deleted": deleted}
