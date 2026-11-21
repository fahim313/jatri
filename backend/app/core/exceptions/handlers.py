import logging

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse

from app.core.exceptions.errors import (
    AppError,
    ConflictError,
    ForbiddenError,
    LLMUnavailableError,
    NotFoundError,
    UnauthorizedError,
)

logger = logging.getLogger(__name__)


def register_exception_handlers(app: FastAPI) -> None:

    @app.exception_handler(NotFoundError)
    async def not_found(_: Request, exc: NotFoundError) -> JSONResponse:
        return JSONResponse(
            status_code=404,
            content={"detail": str(exc)},
        )

    @app.exception_handler(ConflictError)
    async def conflict(_: Request, exc: ConflictError) -> JSONResponse:
        return JSONResponse(
            status_code=409,
            content={"detail": str(exc)},
        )

    @app.exception_handler(UnauthorizedError)
    async def unauthorized(_: Request, exc: UnauthorizedError) -> JSONResponse:
        return JSONResponse(
            status_code=401,
            content={"detail": str(exc)},
            headers={"WWW-Authenticate": "Bearer"},
        )

    @app.exception_handler(ForbiddenError)
    async def forbidden(_: Request, exc: ForbiddenError) -> JSONResponse:
        return JSONResponse(
            status_code=403,
            content={"detail": str(exc)},
        )

    @app.exception_handler(LLMUnavailableError)
    async def llm_unavailable(
        _: Request,
        exc: LLMUnavailableError,
    ) -> JSONResponse:
        logger.warning("LLM provider unavailable: %s", exc)

        return JSONResponse(
            status_code=503,
            content={
                "detail": "The assistant is unavailable. Try again later."
            },
        )

    @app.exception_handler(AppError)
    async def app_error(_: Request, exc: AppError) -> JSONResponse:
        logger.error("Application error: %s", exc)

        return JSONResponse(
            status_code=500,
            content={"detail": "An application error occurred"},
        )

    @app.exception_handler(HTTPException)
    async def http_exception(
        _: Request,
        exc: HTTPException,
    ) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
            headers=exc.headers,
        )

    @app.exception_handler(Exception)
    async def unexpected_exception(
        _: Request,
        exc: Exception,
    ) -> JSONResponse:
        logger.exception("Unexpected application error")

        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"},
        )