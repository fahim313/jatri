from typing import Annotated

from fastapi import Depends

from app.db.session import SessionDep
from app.integrations.llm.dependencies import GroqProviderDep
from app.modules.chat.services.chat import ChatService


def get_chat_service(
    session: SessionDep,
    llm_provider: GroqProviderDep,
) -> ChatService:
    return ChatService(
        session=session,
        llm_provider=llm_provider,
    )


ChatServiceDep = Annotated[
    ChatService,
    Depends(get_chat_service),
]
