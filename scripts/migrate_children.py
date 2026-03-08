#!/usr/bin/env python3
"""
Idempotent migration: Convert has_libby_mary/has_sylvie booleans to children_present list.

For each user with weeks that have has_libby_mary=true or has_sylvie=true:
  1. Seed child_groups on the user document (if not already present)
  2. Convert each week's booleans to children_present list
  3. $unset the old boolean fields

Safe to run before or after code deploy (Beanie ignores extra fields in MongoDB docs).
"""

import asyncio
import os

from motor.motor_asyncio import AsyncIOMotorClient

MONGODB_URL = os.environ.get("MONGODB_URL", "mongodb://localhost:27017")
MONGODB_DB = os.environ.get("MONGODB_DB", "calendarapp")

# Default child groups to seed for users who had these children
DEFAULT_GROUPS = {
    "libby-mary": {
        "id": "libby-mary",
        "name": "Libby & Mary",
        "abbreviation": "L&M",
        "color": "pink",
    },
    "sylvie": {
        "id": "sylvie",
        "name": "Sylvie",
        "abbreviation": "S",
        "color": "purple",
    },
}


async def migrate():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[MONGODB_DB]

    weeks_col = db["weeks"]
    users_col = db["users"]

    # Find all weeks that still have the old boolean fields
    old_weeks = await weeks_col.find(
        {"$or": [{"has_libby_mary": {"$exists": True}}, {"has_sylvie": {"$exists": True}}]}
    ).to_list(length=None)

    if not old_weeks:
        print("No weeks with old boolean fields found. Migration already complete or no data.")
        client.close()
        return

    print(f"Found {len(old_weeks)} week(s) with old boolean fields.")

    # Gather user IDs that need child_groups seeded
    users_needing_groups: dict[str, set[str]] = {}
    for week in old_weeks:
        uid = week.get("user_id")
        if uid not in users_needing_groups:
            users_needing_groups[uid] = set()
        if week.get("has_libby_mary"):
            users_needing_groups[uid].add("libby-mary")
        if week.get("has_sylvie"):
            users_needing_groups[uid].add("sylvie")

    # Step 1: Seed child_groups on users (only if not already set)
    for uid, group_ids in users_needing_groups.items():
        user = await users_col.find_one({"_id": __import__("bson").ObjectId(uid)})
        if not user:
            print(f"  Warning: user {uid} not found, skipping group seeding.")
            continue

        existing_groups = user.get("child_groups", [])
        existing_ids = {g["id"] for g in existing_groups}

        new_groups = []
        for gid in group_ids:
            if gid not in existing_ids:
                new_groups.append(DEFAULT_GROUPS[gid])

        if new_groups:
            await users_col.update_one(
                {"_id": user["_id"]},
                {"$push": {"child_groups": {"$each": new_groups}}},
            )
            print(f"  Seeded {len(new_groups)} child group(s) for user {user.get('username', uid)}.")
        else:
            print(f"  User {user.get('username', uid)} already has child_groups, skipping seed.")

    # Step 2: Convert week booleans to children_present and unset old fields
    migrated = 0
    for week in old_weeks:
        children_present = week.get("children_present", [])

        # Only add if not already present
        if week.get("has_libby_mary") and "libby-mary" not in children_present:
            children_present.append("libby-mary")
        if week.get("has_sylvie") and "sylvie" not in children_present:
            children_present.append("sylvie")

        await weeks_col.update_one(
            {"_id": week["_id"]},
            {
                "$set": {"children_present": children_present},
                "$unset": {"has_libby_mary": "", "has_sylvie": ""},
            },
        )
        migrated += 1

    print(f"Migrated {migrated} week(s).")
    client.close()


if __name__ == "__main__":
    asyncio.run(migrate())
