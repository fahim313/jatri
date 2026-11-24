from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

DocumentStatus = Literal["Pending", "Approved", "Rejected"]


class DocumentCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    source_type: str = Field(min_length=1, max_length=100)
    source_url: str | None = Field(default=None, max_length=500)


class DocumentReview(BaseModel):
    status: Literal["Approved", "Rejected"]
    rejection_reason: str | None = None


class DocumentResponse(BaseModel):
    id: int
    title: str
    description: str | None
    source_type: str
    source_url: str | None
    file_name: str
    file_size: int | None
    total_pages: int | None
    status: DocumentStatus
    managed_by: int
    reviewed_by: int | None
    reviewed_at: datetime | None
    rejection_reason: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)