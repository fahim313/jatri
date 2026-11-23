from datetime import datetime

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    content: str = Field(
        min_length=1,
        max_length=2000,
    )
    conversation_id: int | None = None


class ChatResponse(BaseModel):
    conversation_id: int
    reply: str


class ConversationItem(BaseModel):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class ConversationHistoryResponse(BaseModel):
    items: list[ConversationItem]
    total: int
    limit: int
    offset: int


class MessageItem(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ConversationMessagesResponse(BaseModel):
    conversation_id: int
    items: list[MessageItem]
    total: int
    limit: int
    offset: int
