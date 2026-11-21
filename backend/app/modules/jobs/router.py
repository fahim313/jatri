from fastapi import APIRouter

from app.modules.jobs.controllers.jobs import router as admin_jobs_router
from app.modules.jobs.controllers.public import router as public_jobs_router

router = APIRouter(prefix="/jobs", tags=["Jobs"])

router.include_router(admin_jobs_router)

public_router = APIRouter(
    prefix="/public/jobs",
    tags=["Public Jobs"],
)

public_router.include_router(public_jobs_router)