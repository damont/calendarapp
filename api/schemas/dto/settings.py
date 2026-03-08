from pydantic import BaseModel

from api.schemas.orm.user import ChildGroup


class SettingsResponse(BaseModel):
    child_groups: list[ChildGroup]

    model_config = {"from_attributes": True}


class SettingsUpdateRequest(BaseModel):
    child_groups: list[ChildGroup]
