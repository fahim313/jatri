from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import SystemMessage
from langchain_core.tools import BaseTool
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode, tools_condition
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.tools.agency_tools import create_agency_tools
from app.agents.tools.job_tools import create_job_tools
from app.agents.tools.migrant_tools import create_migrant_tools
from app.modules.chat.services.routing_schemas import QuestionType


def create_agent_graph(
    session: AsyncSession,
    model: BaseChatModel,
    system_prompt: str,
    question_types: list[QuestionType],
):
    tools: list[BaseTool] = []

    if QuestionType.MIGRATION in question_types:
        tools.extend(create_migrant_tools(session))

    if QuestionType.AGENCY in question_types:
        tools.extend(create_agency_tools(session))

    if QuestionType.JOB in question_types:
        tools.extend(create_job_tools(session))

    model_with_tools = model.bind_tools(tools) if tools else model

    async def agent_node(state: MessagesState):
        response = await model_with_tools.ainvoke(
            [
                SystemMessage(content=system_prompt),
                *state["messages"],
            ]
        )

        return {"messages": [response]}

    builder = StateGraph(MessagesState)

    builder.add_node("agent", agent_node)
    builder.add_edge(START, "agent")

    if tools:
        builder.add_node("tools", ToolNode(tools))

        builder.add_conditional_edges(
            "agent",
            tools_condition,
        )

        builder.add_edge("tools", "agent")
    else:
        builder.add_edge("agent", END)

    return builder.compile()
