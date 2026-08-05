import logging

logger = logging.getLogger(__name__)


def settings_from_legacy_user(document: dict) -> dict:
    """Build the embedded settings object from a legacy user document."""
    return {
        "child_groups": document.get("child_groups", []),
        "default_months_out": 3,
    }


async def migrate_user_settings(database) -> tuple[int, int]:
    """Move legacy root-level settings into users.settings exactly once.

    Existing embedded settings always win. Only documents without a settings
    object read the old child_groups field. After the embedded object is
    written successfully, the legacy field is removed.
    """
    users = database["users"]
    migrated = 0

    cursor = users.find(
        {"settings": {"$exists": False}},
        {"child_groups": 1},
    )
    async for document in cursor:
        result = await users.update_one(
            {"_id": document["_id"], "settings": {"$exists": False}},
            {
                "$set": {"settings": settings_from_legacy_user(document)},
                "$unset": {"child_groups": ""},
            },
        )
        migrated += result.modified_count

    # Clean up the legacy field for documents whose settings object already
    # exists (including documents migrated by an earlier application run).
    cleanup = await users.update_many(
        {
            "settings": {"$exists": True},
            "child_groups": {"$exists": True},
        },
        {"$unset": {"child_groups": ""}},
    )

    if migrated or cleanup.modified_count:
        logger.info(
            "User settings migration complete: migrated=%s cleaned=%s",
            migrated,
            cleanup.modified_count,
        )
    return migrated, cleanup.modified_count
