from typing import Annotated

from fastapi import Depends

from app.db.session import SessionDep
from app.integrations.llm.dependencies import ChatModelDep
from app.modules.chat.services.chat import ChatService


def get_chat_service(
    session: SessionDep,
    model: ChatModelDep,
) -> ChatService:
    return ChatService(
        session=session,
        model=model,
    )


ChatServiceDep = Annotated[
    ChatService,
    Depends(get_chat_service),
]
