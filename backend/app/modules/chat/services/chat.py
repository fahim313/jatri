from datetime import datetime
from zoneinfo import ZoneInfo

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions.errors import NotFoundError
from app.integrations.llm.base import ChatMessage, LLMProvider
from app.modules.chat.repositories.chat import ChatRepository
from app.modules.chat.schemas.chat import (
    ChatRequest,
    ChatResponse,
    ConversationHistoryResponse,
    ConversationItem,
    ConversationMessagesResponse,
    MessageItem,
)
from app.modules.chat.services.prompts import JATRI_SYSTEM_PROMPT


class ChatService:
    def __init__(
        self,
        session: AsyncSession,
        llm_provider: LLMProvider,
    ) -> None:
        self.session: AsyncSession = session
        self.repository: ChatRepository = ChatRepository(session)
        self.llm_provider: LLMProvider = llm_provider

    async def send_message(
        self,
        user_id: int,
        request: ChatRequest,
    ) -> ChatResponse:
        try:
            if request.conversation_id is None:
                conversation = await self.repository.create_conversation(
                    user_id=user_id,
                )
            else:
                conversation = await self.repository.get_conversation(
                    conversation_id=request.conversation_id,
                    user_id=user_id,
                )

                if conversation is None:
                    raise NotFoundError(
                        "Conversation",
                        str(request.conversation_id),
                    )

            history = await self.repository.get_messages(
                conversation_id=conversation.id,
                limit=20,
            )

            messages = [
                ChatMessage.model_validate(
                    {
                        "role": message.role,
                        "content": message.content,
                    }
                )
                for message in history
            ]

            messages.append(
                ChatMessage(
                    role="user",
                    content=request.content,
                )
            )

            current_date = datetime.now(
                ZoneInfo("Asia/Dhaka")
            ).date().isoformat()

            system_prompt = JATRI_SYSTEM_PROMPT.replace(
                "{current_date}",
                current_date,
            )

            reply = await self.llm_provider.chat(
                system=system_prompt,
                messages=messages,
            )

            await self.repository.create_message(
                conversation_id=conversation.id,
                role="user",
                content=request.content,
            )

            await self.repository.create_message(
                conversation_id=conversation.id,
                role="assistant",
                content=reply,
            )

            await self.session.commit()

            return ChatResponse(
                conversation_id=conversation.id,
                reply=reply,
            )

        except Exception:
            await self.session.rollback()
            raise

    async def get_conversations(
        self,
        user_id: int,
        limit: int = 20,
        offset: int = 0,
    ) -> ConversationHistoryResponse:
        conversations = await self.repository.get_conversations(
            user_id=user_id,
            limit=limit,
            offset=offset,
        )

        total = await self.repository.count_conversations(
            user_id=user_id,
        )

        return ConversationHistoryResponse(
            items=[
                ConversationItem.model_validate(conversation)
                for conversation in conversations
            ],
            total=total,
            limit=limit,
            offset=offset,
        )

    async def get_conversation_messages(
        self,
        conversation_id: int,
        user_id: int,
        limit: int = 50,
        offset: int = 0,
    ) -> ConversationMessagesResponse:
        conversation = await self.repository.get_conversation(
            conversation_id=conversation_id,
            user_id=user_id,
        )

        if conversation is None:
            raise NotFoundError(
                "Conversation",
                str(conversation_id),
            )

        messages = await self.repository.get_conversation_messages(
            conversation_id=conversation_id,
            limit=limit,
            offset=offset,
        )

        total = await self.repository.count_messages(
            conversation_id=conversation_id,
        )

        return ConversationMessagesResponse(
            conversation_id=conversation_id,
            items=[
                MessageItem.model_validate(message)
                for message in messages
            ],
            total=total,
            limit=limit,
            offset=offset,
        )

    async def delete_conversation(
        self,
        conversation_id: int,
        user_id: int,
    ) -> None:
        try:
            conversation = await self.repository.get_conversation(
                conversation_id=conversation_id,
                user_id=user_id,
            )

            if conversation is None:
                raise NotFoundError(
                    "Conversation",
                    str(conversation_id),
                )

            await self.repository.delete_conversation(conversation)

            await self.session.commit()

        except Exception:
            await self.session.rollback()
            raise