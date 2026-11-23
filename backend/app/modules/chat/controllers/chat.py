from fastapi import APIRouter, Query, Response, status

from app.modules.auth.dependencies import CurrentUserDep
from app.modules.chat.dependencies import ChatServiceDep
from app.modules.chat.schemas.chat import (
    ChatRequest,
    ChatResponse,
    ConversationHistoryResponse,
    ConversationMessagesResponse,
)

router = APIRouter()


@router.post(
    "/",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
)
async def send_message(
    request: ChatRequest,
    current_user: CurrentUserDep,
    chat_service: ChatServiceDep,
) -> ChatResponse:
    return await chat_service.send_message(
        user_id=current_user.id,
        request=request,
    )


@router.get(
    "/conversations/",
    response_model=ConversationHistoryResponse,
    status_code=status.HTTP_200_OK,
)
async def get_conversations(
    current_user: CurrentUserDep,
    chat_service: ChatServiceDep,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> ConversationHistoryResponse:
    return await chat_service.get_conversations(
        user_id=current_user.id,
        limit=limit,
        offset=offset,
    )


@router.get(
    "/conversations/{conversation_id}/messages/",
    response_model=ConversationMessagesResponse,
    status_code=status.HTTP_200_OK,
)
async def get_conversation_messages(
    conversation_id: int,
    current_user: CurrentUserDep,
    chat_service: ChatServiceDep,
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> ConversationMessagesResponse:
    return await chat_service.get_conversation_messages(
        conversation_id=conversation_id,
        user_id=current_user.id,
        limit=limit,
        offset=offset,
    )


@router.delete(
    "/conversations/{conversation_id}/",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_conversation(
    conversation_id: int,
    current_user: CurrentUserDep,
    chat_service: ChatServiceDep,
) -> Response:
    await chat_service.delete_conversation(
        conversation_id=conversation_id,
        user_id=current_user.id,
    )

    return Response(status_code=status.HTTP_204_NO_CONTENT)