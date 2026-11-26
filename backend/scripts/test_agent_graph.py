import asyncio

from langchain_core.messages import HumanMessage

from app.agents.graph import create_agent_graph
from app.db.session import SessionLocal
from app.integrations.llm.dependencies import get_chat_model
from app.modules.chat.services.prompts import JATRI_SYSTEM_PROMPT
from app.modules.chat.services.routing_schemas import QuestionType

QUERY = "What is the official government migration fee for going abroad?"


async def main():
    async with SessionLocal() as session:
        model = get_chat_model()

        graph = create_agent_graph(
            session=session,
            model=model,
            system_prompt=JATRI_SYSTEM_PROMPT,
            question_types=[QuestionType.MIGRATION],
        )

        result = await graph.ainvoke(
            {
                "messages": [
                    HumanMessage(content=QUERY)
                ]
            }
        )

        print("\nAgent Conversation:")

        for message in result["messages"]:
            print(f"\nRole: {message.type}")
            print(f"Content: {message.content}")

            if getattr(message, "tool_calls", None):
                print("Tool Calls:", message.tool_calls)


if __name__ == "__main__":
    asyncio.run(main())