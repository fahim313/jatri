import logging
from datetime import datetime
from zoneinfo import ZoneInfo

from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import (
    AIMessage,
    AnyMessage,
    HumanMessage,
)
from langgraph.graph import MessagesState
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.graph import create_agent_graph
from app.core.exceptions.errors import NotFoundError
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
from app.modules.chat.services.question_router import QuestionRouter

logger = logging.getLogger("uvicorn.error")


class ChatService:
    def __init__(
        self,
        session: AsyncSession,
        model: BaseChatModel,
    ) -> None:
        self.session = session
        self.repository = ChatRepository(session)
        self.model = model
        self.question_router = QuestionRouter(model)

    @staticmethod
    def _build_conversation_context(history) -> str:
        context_parts: list[str] = []

        for message in history:
            role = "User" if message.role == "user" else "Assistant"
            context_parts.append(f"{role}: {message.content}")

        return "\n".join(context_parts)

    @staticmethod
    def _extract_text(content: str | list) -> str:
        if isinstance(content, str):
            return content

        parts: list[str] = []

        for block in content:
            if isinstance(block, str):
                parts.append(block)
            elif isinstance(block, dict):
                text = block.get("text")
                if isinstance(text, str):
                    parts.append(text)

        return "\n".join(parts)

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
                limit=6,
            )

            conversation_context = self._build_conversation_context(
                history
            )

            route = await self.question_router.route(
                question=request.content,
                conversation_context=conversation_context,
            )

            logger.info(
                "Question routed | Conversation ID: %s | Types: %s",
                conversation.id,
                [item.value for item in route.question_types],
            )

            messages: list[AnyMessage] = []

            for message in history:
                if message.role == "user":
                    messages.append(
                        HumanMessage(content=message.content)
                    )
                else:
                    messages.append(
                        AIMessage(content=message.content)
                    )

            messages.append(
                HumanMessage(content=request.content)
            )

            current_date = datetime.now(
                ZoneInfo("Asia/Dhaka")
            ).date().isoformat()

            system_prompt = JATRI_SYSTEM_PROMPT.replace(
                "{current_date}",
                current_date,
            )

            graph = create_agent_graph(
                session=self.session,
                model=self.model,
                system_prompt=system_prompt,
                question_types=route.question_types,
            )

            logger.info(
                "Starting agent execution | Conversation ID: %s",
                conversation.id,
            )

            initial_state: MessagesState = {
                "messages": messages,
            }

            result = await graph.ainvoke(initial_state)

            logger.info(
                "Agent execution completed | Conversation ID: %s",
                conversation.id,
            )

            final_message = result["messages"][-1]
            reply = self._extract_text(final_message.content)

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
            logger.exception(
                "Chat request failed | User ID: %s",
                user_id,
            )
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
            conversation_id=conversation.id,
        )

        return ConversationMessagesResponse(
            conversation_id=conversation.id,
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
