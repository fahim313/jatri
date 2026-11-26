import json
import logging
from typing import Any

from groq import APIError, AsyncGroq, BadRequestError, RateLimitError
from groq.types.chat import (
    ChatCompletion,
    ChatCompletionMessageParam,
    ChatCompletionToolParam,
)

from app.core.exceptions.errors import LLMRateLimitError, LLMUnavailableError
from app.integrations.llm.base import (
    ChatMessage,
    LLMReply,
    ToolRunner,
    ToolSpec,
)

MAX_TOOL_ROUNDS = 5

# Attempts for a single model call when the model produces an invalid
# tool call. Keep this low because every attempt consumes tokens.
MAX_TOOL_CALL_ATTEMPTS = 2

TOOL_FAILURE_RESULT: dict[str, object] = {
    "status": "error",
    "message": "The requested information could not be retrieved right now.",
}

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


def retry_after_seconds(exc: RateLimitError) -> int | None:
    value = exc.response.headers.get("retry-after")

    if not value:
        return None

    try:
        return int(float(value))
    except ValueError:
        return None


def to_llm_error(exc: APIError) -> LLMUnavailableError:
    if isinstance(exc, RateLimitError):
        return LLMRateLimitError(retry_after_seconds(exc))

    return LLMUnavailableError()


def parse_tool_arguments(raw_arguments: str | None) -> dict[str, Any]:
    try:
        parsed = json.loads(raw_arguments or "{}")
    except json.JSONDecodeError:
        logger.warning("Invalid JSON arguments received for a tool call.")
        return {}

    if not isinstance(parsed, dict):
        logger.warning("Tool arguments were not a JSON object.")
        return {}

    return parsed


class GroqProvider:
    def __init__(self, api_key: str, model: str) -> None:
        self.client: AsyncGroq = AsyncGroq(api_key=api_key)
        self.model: str = model

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
            logger.warning("Groq API error: %s", exc)
            raise to_llm_error(exc) from exc

        return response.choices[0].message.content or ""

    async def _complete_with_tools(
        self,
        conversation: list[ChatCompletionMessageParam],
        groq_tools: list[ChatCompletionToolParam],
    ) -> ChatCompletion:
        """Call the model with tools, retrying invalid tool calls once."""
        for attempt in range(1, MAX_TOOL_CALL_ATTEMPTS + 1):
            try:
                return await self.client.chat.completions.create(
                    model=self.model,
                    messages=conversation,
                    tools=groq_tools,
                    tool_choice="auto",
                )
            except BadRequestError as exc:
                is_invalid_tool_call = "tool_use_failed" in str(exc)

                if is_invalid_tool_call and attempt < MAX_TOOL_CALL_ATTEMPTS:
                    logger.warning(
                        "Model produced an invalid tool call "
                        "(attempt %s/%s). Retrying.",
                        attempt,
                        MAX_TOOL_CALL_ATTEMPTS,
                    )
                    continue

                logger.warning("Groq API error: %s", exc)
                raise to_llm_error(exc) from exc
            except APIError as exc:
                logger.warning("Groq API error: %s", exc)
                raise to_llm_error(exc) from exc

        # The loop always returns or raises. This is only a safeguard.
        raise LLMUnavailableError()

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
            response = await self._complete_with_tools(
                conversation,
                groq_tools,
            )

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
                arguments = parse_tool_arguments(tool_call.function.arguments)

                tool_calls.append(describe_call(tool_name, arguments))

                logger.info(
                    "[round %s] model requested %s",
                    round_no,
                    tool_calls[-1],
                )

                result: object

                try:
                    result = await run_tool(tool_name, arguments)
                except Exception:
                    logger.exception(
                        "Tool execution failed: %s",
                        tool_name,
                    )
                    result = TOOL_FAILURE_RESULT

                conversation.append(
                    {
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "content": json.dumps(
                            result,
                            ensure_ascii=False,
                            default=str,
                        ),
                    }
                )

        return LLMReply(
            text="Sorry, I couldn't finish that. Please ask in a simpler way.",
            tool_calls=tool_calls,
        )