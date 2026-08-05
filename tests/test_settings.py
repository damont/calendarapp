from datetime import datetime, timezone
from typing import cast

import pytest
from pydantic import ValidationError

from api.migrations import migrate_user_settings, settings_from_legacy_user
from api.routes.settings import get_settings, update_settings
from api.schemas.dto.settings import SettingsResponse, SettingsUpdateRequest
from api.schemas.orm.user import ChildGroup, User, UserSettings


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
    settings = UserSettings.model_validate(settings_from_legacy_user(legacy_user_data()))

    assert settings.default_months_out == 3
    assert [group.id for group in settings.child_groups] == ["kids"]


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


class FakeResult:
    def __init__(self, modified_count):
        self.modified_count = modified_count


class FakeCursor:
    def __init__(self, documents):
        self.documents = iter(documents)

    def __aiter__(self):
        return self

    async def __anext__(self):
        try:
            return next(self.documents)
        except StopIteration as exc:
            raise StopAsyncIteration from exc


class FakeUsersCollection:
    def __init__(self, documents):
        self.documents = documents

    def find(self, _query, _projection):
        return FakeCursor([doc.copy() for doc in self.documents if "settings" not in doc])

    async def update_one(self, query, update):
        for document in self.documents:
            if document["_id"] == query["_id"] and "settings" not in document:
                document["settings"] = update["$set"]["settings"]
                document.pop("child_groups", None)
                return FakeResult(1)
        return FakeResult(0)

    async def update_many(self, _query, _update):
        modified = 0
        for document in self.documents:
            if "settings" in document and "child_groups" in document:
                document.pop("child_groups")
                modified += 1
        return FakeResult(modified)


@pytest.mark.asyncio
async def test_database_migration_prefers_new_settings_and_removes_legacy_field():
    documents = [
        {
            "_id": "legacy",
            "child_groups": [{"id": "old"}],
        },
        {
            "_id": "current",
            "child_groups": [{"id": "stale"}],
            "settings": {
                "child_groups": [{"id": "new"}],
                "default_months_out": 6,
            },
        },
    ]
    collection = FakeUsersCollection(documents)

    migrated, cleaned = await migrate_user_settings({"users": collection})

    assert (migrated, cleaned) == (1, 1)
    assert documents[0]["settings"]["child_groups"] == [{"id": "old"}]
    assert documents[0]["settings"]["default_months_out"] == 3
    assert documents[1]["settings"]["child_groups"] == [{"id": "new"}]
    assert documents[1]["settings"]["default_months_out"] == 6
    assert all("child_groups" not in document for document in documents)
