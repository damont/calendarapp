from pydantic import BaseModel, Field

from api.schemas.orm.user import ChildGroup


class SettingsResponse(BaseModel):
    child_groups: list[ChildGroup]
    default_months_out: int = Field(default=3, ge=1, le=24)

    model_config = {"from_attributes": True}


class SettingsUpdateRequest(BaseModel):
    # Optional fields keep existing API clients backward-compatible and allow
    # one setting to be changed without overwriting the others.
    child_groups: list[ChildGroup] | None = None
    default_months_out: int | None = Field(default=None, ge=1, le=24)
