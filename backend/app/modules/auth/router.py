from fastapi import APIRouter

from app.modules.auth.controllers.auth import router as auth_controller

router = APIRouter(prefix="/auth", tags=["Authentication"])

router.include_router(auth_controller)