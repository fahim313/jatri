from fastapi import APIRouter

from app.modules.chat.controllers.chat import router as chat_controller

router = APIRouter()

router.include_router(
    chat_controller,
    tags=["Chat"],
)
