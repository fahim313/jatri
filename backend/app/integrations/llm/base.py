from collections.abc import Awaitable, Callable
from typing import Any, Literal, Protocol

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ToolSpec(BaseModel):
    name: str
    description: str
    parameters: dict[str, Any]


ToolRunner = Callable[
    [str, dict[str, Any]],
    Awaitable[dict[str, Any]],
]


class LLMReply(BaseModel):
    text: str = ""
    tool_calls: list[str] = Field(default_factory=list)


class LLMProvider(Protocol):
    async def chat(
        self,
        system: str,
        messages: list[ChatMessage],
    ) -> str:
        ...

    async def chat_with_tools(
        self,
        system: str,
        messages: list[ChatMessage],
        tools: list[ToolSpec],
        run_tool: ToolRunner,
    ) -> LLMReply:
        ... 