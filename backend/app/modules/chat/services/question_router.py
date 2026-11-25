from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import HumanMessage, SystemMessage

from app.modules.chat.services.routing_schemas import QuestionRoute

ROUTER_SYSTEM_PROMPT = """
You are the question router for Jatri, a migrant worker assistance platform.

Classify the user's question into one or more of these categories:

1. migration:
   Questions about migration rules, visa requirements, passports,
   travel procedures, migration costs, worker safety, and overseas
   employment regulations.

2. agency:
   Questions about recruitment agencies, agency licenses,
   agency contact information, and agency details.

3. job:
   Questions about available jobs, job details, salaries,
   job requirements, and job applications.

4. general:
   General conversation and topics unrelated to Jatri's migration,
   agency, or job services.

Rules:
- Select every category relevant to the question.
- A question involving both an agency and migration must include
  both agency and migration.
- A question involving both a job and migration must include
  both job and migration.
- Use general only when no other category is relevant.
- Consider the conversation context when interpreting follow-up
  questions.
- Do not answer the user's question. Only classify it.
"""


class QuestionRouter:
    def __init__(self, model: BaseChatModel) -> None:
        self.model = model.with_structured_output(
            QuestionRoute,
            method="function_calling",
        )

    async def route(
        self,
        question: str,
        conversation_context: str = "",
    ) -> QuestionRoute:
        messages = [
            SystemMessage(content=ROUTER_SYSTEM_PROMPT),
            HumanMessage(
                content=(
                    f"Conversation context:\n{conversation_context}\n\n"
                    f"Current user question:\n{question}"
                )
            ),
        ]

        result = await self.model.ainvoke(messages)

        return QuestionRoute.model_validate(result)