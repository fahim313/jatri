from app.agents.tools.agency_tools import create_agency_tools
from app.agents.tools.job_tools import create_job_tools
from app.agents.tools.migrant_tools import create_migrant_tools
from app.mcp.dependencies import get_mcp_session


async def verify_agency(
    rl_number: str | None = None,
    name: str | None = None,
):
    async with get_mcp_session() as session:
        [agency_tool] = create_agency_tools(session)
        return await agency_tool.ainvoke({
            "rl_number": rl_number,
            "name": name,
        })


async def search_jobs(
    search: str | None = None,
    country: str | None = None,
):
    async with get_mcp_session() as session:
        [job_tool] = create_job_tools(session)
        return await job_tool.ainvoke({
            "search": search,
            "country": country,
        })


async def search_migrant_documents(query: str):
    async with get_mcp_session() as session:
        [migrant_tool] = create_migrant_tools(session)
        return await migrant_tool.ainvoke({
            "query": query,
        })
