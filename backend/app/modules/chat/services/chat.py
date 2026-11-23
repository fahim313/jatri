from datetime import datetime
from zoneinfo import ZoneInfo

from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import AIMessage, HumanMessage
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


class ChatService:
    def __init__(
        self,
        session: AsyncSession,
        model: BaseChatModel,
    ) -> None:
        self.session = session
        self.repository = ChatRepository(session)
        self.model = model

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

            messages = []

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
            )

            result = await graph.ainvoke(
                {"messages": messages}
            )

            final_message = result["messages"][-1]
            reply = final_message.content

            if not isinstance(reply, str):
                reply = "".join(
                    block.get("text", "")
                    for block in reply
                    if isinstance(block, dict)
                    and block.get("type") == "text"
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
