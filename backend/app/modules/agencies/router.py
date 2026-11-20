from fastapi import APIRouter

from app.modules.agencies.controllers.agencies import router as agency_controller

router = APIRouter(prefix="/agencies", tags=["Agencies"])

router.include_router(agency_controller)