"""
Migrate existing weeks to a specific user.

Usage:
    uv run python scripts/migrate_weeks_to_user.py <username>

Finds all week documents with no user_id and assigns them to the given user.
"""

import asyncio
import sys

from motor.motor_asyncio import AsyncIOMotorClient

from api.config import get_settings


async def migrate(username: str) -> None:
    settings = get_settings()
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.mongodb_db_name]

    # Look up the user
    user = await db.users.find_one({"username": username})
    if not user:
        print(f"Error: User '{username}' not found. Register first.")
        sys.exit(1)

    user_id = str(user["_id"])
    print(f"Found user '{username}' (id: {user_id})")

    # Find weeks without a user_id
    result = await db.weeks.update_many(
        {"user_id": {"$exists": False}},
        {"$set": {"user_id": user_id}},
    )

    print(f"Migrated {result.modified_count} week(s) to user '{username}'")
    client.close()


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: uv run python scripts/migrate_weeks_to_user.py <username>")
        sys.exit(1)

    username = sys.argv[1]
    asyncio.run(migrate(username))


if __name__ == "__main__":
    main()
