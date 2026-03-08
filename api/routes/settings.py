from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from api.schemas.dto.settings import SettingsResponse, SettingsUpdateRequest
from api.schemas.orm.user import User
from api.utils.auth import get_current_user

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("", response_model=SettingsResponse)
async def get_settings(user: User = Depends(get_current_user)):
    """Get user settings."""
    return SettingsResponse(child_groups=user.child_groups)


@router.put("", response_model=SettingsResponse)
async def update_settings(
    request: SettingsUpdateRequest,
    user: User = Depends(get_current_user),
):
    """Update user settings."""
    user.child_groups = request.child_groups
    user.updated_at = datetime.now(timezone.utc)
    await user.save()
    return SettingsResponse(child_groups=user.child_groups)
