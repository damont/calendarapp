from datetime import datetime

from api.schemas.dto.week import WeekUpdateRequest
from api.schemas.orm.week import Week
from api.utils.dates import get_week_end, get_week_start, get_weeks_in_range


async def get_or_create_week(week_start: datetime) -> Week:
    """
    Get a week by its start date, or create it with defaults if it doesn't exist.
    """
    normalized_start = get_week_start(week_start)
    week = await Week.find_one(Week.week_start == normalized_start)

    if week is None:
        week = Week(
            week_start=normalized_start,
            week_end=get_week_end(normalized_start),
            has_libby_mary=False,
            has_sylvie=False,
            weekend_plans=[],
            weekday_events=[],
            sports=[],
            notes=None,
        )
        await week.insert()

    return week


async def get_weeks_by_range(start_date: datetime, end_date: datetime) -> list[Week]:
    """
    Get all weeks in a date range, auto-creating any that don't exist.
    """
    week_ranges = get_weeks_in_range(start_date, end_date)
    weeks = []

    for week_start, _ in week_ranges:
        week = await get_or_create_week(week_start)
        weeks.append(week)

    return sorted(weeks, key=lambda w: w.week_start)


async def update_week(week_start: datetime, update_data: WeekUpdateRequest) -> Week:
    """
    Update a week's fields. Creates the week if it doesn't exist.
    """
    week = await get_or_create_week(week_start)

    update_dict = update_data.model_dump(exclude_unset=True)
    if update_dict:
        update_dict["updated_at"] = datetime.utcnow()
        await week.update({"$set": update_dict})
        await week.sync()

    return week


async def delete_week(week_start: datetime) -> bool:
    """
    Delete a week (reset to nothing - it will be recreated with defaults on next access).
    """
    normalized_start = get_week_start(week_start)
    week = await Week.find_one(Week.week_start == normalized_start)

    if week:
        await week.delete()
        return True

    return False
