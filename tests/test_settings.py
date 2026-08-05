from datetime import datetime, timezone
from typing import cast

import pytest
from pydantic import ValidationError

from api.routes.settings import get_settings, update_settings
from api.schemas.dto.settings import SettingsResponse, SettingsUpdateRequest
from api.schemas.orm.user import ChildGroup, User, UserSettings, migrate_legacy_user_settings


def legacy_user_data():
    now = datetime.now(timezone.utc)
    return {
        "username": "legacy@example.com",
        "email": "legacy@example.com",
        "hashed_password": "hash",
        "display_name": "Legacy User",
        "child_groups": [
            {
                "id": "kids",
                "name": "Kids",
                "abbreviation": "K",
                "color": "blue",
            }
        ],
        "created_at": now,
        "updated_at": now,
    }


def test_legacy_child_groups_migrate_into_single_settings_container():
    migrated = migrate_legacy_user_settings(legacy_user_data())
    settings = UserSettings.model_validate(migrated["settings"])

    assert settings.default_months_out == 3
    assert [group.id for group in settings.child_groups] == ["kids"]
    assert "settings" in migrated


def test_new_user_settings_default_to_three_months():
    settings = UserSettings()

    assert settings.default_months_out == 3
    assert settings.child_groups == []


def test_settings_update_is_partial_for_backward_compatibility():
    request = SettingsUpdateRequest(child_groups=[])

    assert request.child_groups == []
    assert request.default_months_out is None


def test_months_out_is_limited_to_supported_range():
    with pytest.raises(ValidationError):
        SettingsUpdateRequest(default_months_out=0)
    with pytest.raises(ValidationError):
        SettingsUpdateRequest(default_months_out=25)


def test_settings_response_defaults_to_three_months():
    response = SettingsResponse(child_groups=[])

    assert response.default_months_out == 3


class FakeUser:
    def __init__(self):
        self.settings = UserSettings(
            child_groups=[ChildGroup(id="kids", name="Kids", abbreviation="K", color="blue")]
        )
        self.updated_at = None
        self.saved = False

    async def save(self):
        self.saved = True


@pytest.mark.asyncio
async def test_get_settings_returns_the_embedded_settings_object():
    response = await get_settings(cast(User, FakeUser()))

    assert response.default_months_out == 3
    assert [group.id for group in response.child_groups] == ["kids"]


@pytest.mark.asyncio
async def test_updating_months_out_preserves_child_groups():
    user = FakeUser()

    response = await update_settings(
        SettingsUpdateRequest(default_months_out=6), cast(User, user)
    )

    assert response.default_months_out == 6
    assert [group.id for group in response.child_groups] == ["kids"]
    assert user.saved is True
