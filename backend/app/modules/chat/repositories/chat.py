from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.chat.models.chat import Conversation, Message


class ChatRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session: AsyncSession = session

    async def create_conversation(
        self,
        user_id: int,
    ) -> Conversation:
        conversation = Conversation(user_id=user_id)

        self.session.add(conversation)
        await self.session.flush()
        await self.session.refresh(conversation)

        return conversation

    async def get_conversation(
        self,
        conversation_id: int,
        user_id: int,
    ) -> Conversation | None:
        statement = select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id,
        )

        result = await self.session.execute(statement)

        return result.scalar_one_or_none()

    async def get_conversations(
        self,
        user_id: int,
        limit: int = 20,
        offset: int = 0,
    ) -> list[Conversation]:
        statement = (
            select(Conversation)
            .where(Conversation.user_id == user_id)
            .order_by(
                Conversation.created_at.desc(),
                Conversation.id.desc(),
            )
            .offset(offset)
            .limit(limit)
        )

        result = await self.session.execute(statement)

        return list(result.scalars().all())

    async def count_conversations(
        self,
        user_id: int,
    ) -> int:
        statement = (
            select(func.count())
            .select_from(Conversation)
            .where(Conversation.user_id == user_id)
        )

        result = await self.session.execute(statement)

        return result.scalar_one()

    async def get_messages(
        self,
        conversation_id: int,
        limit: int = 20,
    ) -> list[Message]:
        statement = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(
                Message.created_at.desc(),
                Message.id.desc(),
            )
            .limit(limit)
        )

        result = await self.session.execute(statement)
        messages = list(result.scalars().all())

        return list(reversed(messages))

    async def get_conversation_messages(
        self,
        conversation_id: int,
        limit: int = 50,
        offset: int = 0,
    ) -> list[Message]:
        statement = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(
                Message.created_at.asc(),
                Message.id.asc(),
            )
            .offset(offset)
            .limit(limit)
        )

        result = await self.session.execute(statement)

        return list(result.scalars().all())

    async def count_messages(
        self,
        conversation_id: int,
    ) -> int:
        statement = (
            select(func.count())
            .select_from(Message)
            .where(Message.conversation_id == conversation_id)
        )

        result = await self.session.execute(statement)

        return result.scalar_one()

    async def create_message(
        self,
        conversation_id: int,
        role: str,
        content: str,
    ) -> None:
        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
        )

        self.session.add(message)
        await self.session.flush()

    async def delete_conversation(
        self,
        conversation: Conversation,
    ) -> None:
        await self.session.delete(conversation)