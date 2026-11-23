from functools import lru_cache
from typing import Annotated

from fastapi import Depends
from langchain_groq import ChatGroq

from app.core.config import get_settings


@lru_cache
def get_chat_model() -> ChatGroq:
    settings = get_settings()

    return ChatGroq(
        api_key=settings.GROQ_API_KEY,
        model=settings.GROQ_MODEL,
        temperature=0,
    )


ChatModelDep = Annotated[
    ChatGroq,
    Depends(get_chat_model),
]

