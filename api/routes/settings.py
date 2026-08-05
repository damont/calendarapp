from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from api.schemas.dto.settings import SettingsResponse, SettingsUpdateRequest
from api.schemas.orm.user import User
from api.utils.auth import get_current_user

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("", response_model=SettingsResponse)
async def get_settings(user: User = Depends(get_current_user)):
    """Get user settings."""
    return SettingsResponse(**user.settings.model_dump())


@router.put("", response_model=SettingsResponse)
async def update_settings(
    request: SettingsUpdateRequest,
    user: User = Depends(get_current_user),
):
    """Update user settings."""
    if request.child_groups is not None:
        user.settings.child_groups = request.child_groups
    if request.default_months_out is not None:
        user.settings.default_months_out = request.default_months_out
    user.updated_at = datetime.now(timezone.utc)
    await user.save()
    return SettingsResponse(**user.settings.model_dump())
