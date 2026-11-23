import json
import logging
from typing import Any

from groq import APIError, AsyncGroq
from groq.types.chat import (
    ChatCompletionMessageParam,
    ChatCompletionToolParam,
)

from app.core.exceptions.errors import LLMUnavailableError
from app.integrations.llm.base import (
    ChatMessage,
    LLMReply,
    ToolRunner,
    ToolSpec,
)

MAX_TOOL_ROUNDS = 5

logger = logging.getLogger("uvicorn.error")


def to_groq_messages(
    system: str,
    messages: list[ChatMessage],
) -> list[ChatCompletionMessageParam]:
    conversation: list[ChatCompletionMessageParam] = [
        {
            "role": "system",
            "content": system,
        }
    ]

    for message in messages:
        if message.role == "user":
            conversation.append(
                {
                    "role": "user",
                    "content": message.content,
                }
            )
        else:
            conversation.append(
                {
                    "role": "assistant",
                    "content": message.content,
                }
            )

    return conversation


def to_groq_tools(
    tools: list[ToolSpec],
) -> list[ChatCompletionToolParam]:
    return [
        {
            "type": "function",
            "function": {
                "name": tool.name,
                "description": tool.description,
                "parameters": tool.parameters,
            },
        }
        for tool in tools
    ]


def describe_call(name: str, args: dict[str, Any]) -> str:
    arguments = ", ".join(
        f"{key}={value!r}" for key, value in args.items()
    )
    return f"{name}({arguments})"


class GroqProvider:
    def __init__(self, api_key: str, model: str) -> None:
        self.client = AsyncGroq(api_key=api_key)
        self.model = model

    async def chat(
        self,
        system: str,
        messages: list[ChatMessage],
    ) -> str:
        conversation = to_groq_messages(system, messages)

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=conversation,
            )
        except APIError as exc:
            raise LLMUnavailableError() from exc

        return response.choices[0].message.content or ""

    async def chat_with_tools(
        self,
        system: str,
        messages: list[ChatMessage],
        tools: list[ToolSpec],
        run_tool: ToolRunner,
    ) -> LLMReply:
        conversation = to_groq_messages(system, messages)
        groq_tools = to_groq_tools(tools)
        tool_calls: list[str] = []

        for round_no in range(1, MAX_TOOL_ROUNDS + 1):
            try:
                response = await self.client.chat.completions.create(
                    model=self.model,
                    messages=conversation,
                    tools=groq_tools,
                    tool_choice="auto",
                )
            except APIError as exc:
                raise LLMUnavailableError() from exc

            assistant_message = response.choices[0].message
            requested_tools = assistant_message.tool_calls or []

            if not requested_tools:
                logger.info(
                    "[round %s] model answered with text",
                    round_no,
                )

                return LLMReply(
                    text=assistant_message.content or "",
                    tool_calls=tool_calls,
                )

            conversation.append(
                {
                    "role": "assistant",
                    "content": assistant_message.content,
                    "tool_calls": [
                        {
                            "id": call.id,
                            "type": "function",
                            "function": {
                                "name": call.function.name,
                                "arguments": call.function.arguments,
                            },
                        }
                        for call in requested_tools
                    ],
                }
            )

            for tool_call in requested_tools:
                tool_name = tool_call.function.name

                try:
                    arguments: dict[str, Any] = json.loads(
                        tool_call.function.arguments or "{}"
                    )
                except json.JSONDecodeError:
                    logger.warning(
                        "Invalid JSON arguments received for tool %s",
                        tool_name,
                    )
                    arguments = {}

                tool_calls.append(
                    describe_call(tool_name, arguments)
                )

                logger.info(
                    "[round %s] model requested %s",
                    round_no,
                    tool_calls[-1],
                )

                result = await run_tool(tool_name, arguments)

                conversation.append(
                    {
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "content": json.dumps(
                            result,
                            ensure_ascii=False,
                        ),
                    }
                )

        return LLMReply(
            text="Sorry, I couldn't finish that. Please ask in a simpler way.",
            tool_calls=tool_calls,
        )
