from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class JobOfferCreate(BaseModel):
    country: str = Field(min_length=1, max_length=100)
    job_title: str = Field(min_length=1, max_length=255)
    salary: str = Field(min_length=1, max_length=100)
    requirements: str | None = None
    vacancies: int | None = Field(default=None, gt=0)
    application_deadline: date | None = None
    source_url: str | None = Field(default=None, max_length=500)


class JobOfferUpdate(BaseModel):
    country: str | None = Field(default=None, min_length=1, max_length=100)
    job_title: str | None = Field(default=None, min_length=1, max_length=255)
    salary: str | None = Field(default=None, min_length=1, max_length=100)
    requirements: str | None = None
    vacancies: int | None = Field(default=None, gt=0)
    application_deadline: date | None = None
    source_url: str | None = Field(default=None, max_length=500)


class JobOfferResponse(BaseModel):
    id: int
    country: str
    job_title: str
    salary: str
    requirements: str | None
    vacancies: int | None
    application_deadline: date | None
    source_url: str | None
    status: str
    last_verified_at: datetime | None
    managed_by: int

    model_config = ConfigDict(from_attributes=True)