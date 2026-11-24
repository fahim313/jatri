from fastapi import APIRouter

from app.modules.documents.controllers.document_controller import (
    router as document_controller,
)

router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)

router.include_router(document_controller)