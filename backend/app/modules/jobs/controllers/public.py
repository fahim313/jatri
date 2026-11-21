from fastapi import APIRouter, Query

from app.modules.jobs.dependencies import JobServiceDep
from app.modules.jobs.schemas.jobs import JobOfferResponse

router = APIRouter()


@router.get("/", response_model=list[JobOfferResponse])
async def get_public_jobs(
    service: JobServiceDep,
    search: str | None = Query(default=None),
    country: str | None = Query(default=None),
):
    return await service.get_public_jobs(
        search=search,
        country=country,
    )


@router.get("/{job_id}", response_model=JobOfferResponse)
async def get_public_job(
    job_id: int,
    service: JobServiceDep,
):
    return await service.get_public_job(job_id)