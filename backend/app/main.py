from fastapi import FastAPI

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions.handlers import register_exception_handlers

app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.APP_ENV == "development",
)

register_exception_handlers(app)

app.include_router(api_router)