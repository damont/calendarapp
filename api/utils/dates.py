from datetime import datetime, timedelta


def get_week_start(date: datetime) -> datetime:
    """Get the Monday of the week containing the given date."""
    days_since_monday = date.weekday()
    monday = date - timedelta(days=days_since_monday)
    return monday.replace(hour=0, minute=0, second=0, microsecond=0)


def get_week_end(date: datetime) -> datetime:
    """Get the Sunday of the week containing the given date."""
    monday = get_week_start(date)
    sunday = monday + timedelta(days=6)
    return sunday.replace(hour=23, minute=59, second=59, microsecond=999999)


def get_weeks_in_range(start_date: datetime, end_date: datetime) -> list[tuple[datetime, datetime]]:
    """
    Get all week (Monday, Sunday) tuples that overlap with the given date range.
    """
    weeks = []
    current = get_week_start(start_date)
    end_week_start = get_week_start(end_date)

    while current <= end_week_start:
        week_end = get_week_end(current)
        weeks.append((current, week_end))
        current = current + timedelta(days=7)

    return weeks


def format_week_label(week_start: datetime) -> str:
    """Format a week start date as a human-readable label."""
    week_end = week_start + timedelta(days=6)
    if week_start.month == week_end.month:
        return f"{week_start.strftime('%b %d')} - {week_end.strftime('%d, %Y')}"
    elif week_start.year == week_end.year:
        return f"{week_start.strftime('%b %d')} - {week_end.strftime('%b %d, %Y')}"
    else:
        return f"{week_start.strftime('%b %d, %Y')} - {week_end.strftime('%b %d, %Y')}"
