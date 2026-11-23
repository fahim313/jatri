from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import SystemMessage
from langgraph.graph import START, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode, tools_condition
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.tools.agency_tools import create_agency_tools
from app.agents.tools.job_tools import create_job_tools


def create_agent_graph(
    session: AsyncSession,
    model: BaseChatModel,
    system_prompt: str,
):
    tools = [
        *create_agency_tools(session),
        *create_job_tools(session),
    ]

    model_with_tools = model.bind_tools(tools)

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
    builder.add_node("tools", ToolNode(tools))

    builder.add_edge(START, "agent")

    builder.add_conditional_edges(
        "agent",
        tools_condition,
    )

    builder.add_edge("tools", "agent")

    return builder.compile()
