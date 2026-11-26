import argparse
import asyncio

from mcp.server.mcpserver import MCPServer

from app.mcp.prompts import MIGRATION_ASSISTANCE_PROMPT
from app.mcp.resources import (
    MIGRATION_RESOURCE_CONTENT,
    MIGRATION_RESOURCE_URI,
)
from app.mcp.tools import (
    search_jobs,
    search_migrant_documents,
    verify_agency,
)

mcp = MCPServer(
    name="jatri-mcp",
    version="1.0.0",
    instructions=(
        "Jatri MCP server provides migration assistance, "
        "recruitment agency verification, and job search services."
    ),
)

mcp.tool()(verify_agency)
mcp.tool()(search_jobs)
mcp.tool()(search_migrant_documents)


@mcp.resource(MIGRATION_RESOURCE_URI)
def migration_guide() -> str:
    """Provide general information about Jatri migration assistance."""
    return MIGRATION_RESOURCE_CONTENT


@mcp.prompt(
    name="migration_assistance",
    description="Assist users with overseas migration information.",
)
def migration_assistance() -> str:
    """Provide instructions for migration assistance."""
    return MIGRATION_ASSISTANCE_PROMPT


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--transport",
        choices=["http", "stdio"],
        default="http",
    )
    args = parser.parse_args()

    if args.transport == "stdio":
        await mcp.run_stdio_async()
    else:
        await mcp.run_streamable_http_async(
            host="0.0.0.0",
            port=8765,
            streamable_http_path="/mcp",
        )


if __name__ == "__main__":
    asyncio.run(main())
