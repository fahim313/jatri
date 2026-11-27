from enum import Enum

from pydantic import BaseModel, Field


class QuestionType(str, Enum):
    MIGRATION = "migration"
    AGENCY = "agency"
    JOB = "job"
    GENERAL = "general"


class QuestionRoute(BaseModel):
    question_types: list[QuestionType] = Field(
        min_length=1,
        description=(
            "All categories relevant to the user's question. "
            "Select multiple categories when the question involves "
            "more than one topic."
        ),
    )

    reasoning: str = Field(
        description="A brief explanation of the routing decision."
    )