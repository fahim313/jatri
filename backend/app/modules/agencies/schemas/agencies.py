from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class AgencyCreate(BaseModel):
    name: str
    rl_number: str
    license_status: str
    license_expiry: date | None = None


class AgencyUpdate(BaseModel):
    name: str | None = None
    rl_number: str | None = None
    license_status: str | None = None
    license_expiry: date | None = None


class AgencyResponse(BaseModel):
    id: int
    name: str
    rl_number: str
    license_status: str
    license_expiry: date | None
    last_verified_at: datetime | None
    managed_by: int

    model_config = ConfigDict(from_attributes=True)