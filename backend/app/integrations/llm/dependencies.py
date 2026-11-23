from functools import lru_cache
from typing import Annotated

from fastapi import Depends

from app.core.config import get_settings
from app.integrations.llm.groq import GroqProvider


@lru_cache
def get_groq_provider() -> GroqProvider:
    settings = get_settings()

    return GroqProvider(
        api_key=settings.GROQ_API_KEY.get_secret_value(),
        model=settings.GROQ_MODEL,
    )


GroqProviderDep = Annotated[
    GroqProvider,
    Depends(get_groq_provider),
]
