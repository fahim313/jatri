from fastapi import APIRouter, Query, status

from app.modules.auth.dependencies import AdminUserDep
from app.modules.jobs.dependencies import JobServiceDep
from app.modules.jobs.schemas.jobs import (
    JobOfferCreate,
    JobOfferResponse,
    JobOfferUpdate,
)

router = APIRouter()


@router.post(
    "/",
    response_model=JobOfferResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_job(
    job_data: JobOfferCreate,
    service: JobServiceDep,
    current_user: AdminUserDep,
):
    return await service.create_job(
        job_data,
        managed_by=current_user.id,
    )


@router.get(
    "/",
    response_model=list[JobOfferResponse],
)
async def get_jobs(
    service: JobServiceDep,
    current_user: AdminUserDep,
    search: str | None = Query(default=None),
    country: str | None = Query(default=None),
    job_status: str | None = Query(default=None, alias="status"),
):
    return await service.get_jobs(
        search=search,
        country=country,
        job_status=job_status,
    )


@router.get(
    "/{job_id}",
    response_model=JobOfferResponse,
)
async def get_job(
    job_id: int,
    service: JobServiceDep,
    current_user: AdminUserDep,
):
    return await service.get_job(job_id)


@router.patch(
    "/{job_id}",
    response_model=JobOfferResponse,
)
async def update_job(
    job_id: int,
    job_data: JobOfferUpdate,
    service: JobServiceDep,
    current_user: AdminUserDep,
):
    return await service.update_job(job_id, job_data)


@router.delete(
    "/{job_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_job(
    job_id: int,
    service: JobServiceDep,
    current_user: AdminUserDep,
):
    await service.delete_job(job_id)


@router.patch(
    "/{job_id}/publish",
    response_model=JobOfferResponse,
)
async def publish_job(
    job_id: int,
    service: JobServiceDep,
    current_user: AdminUserDep,
):
    return await service.publish_job(job_id)


@router.patch(
    "/{job_id}/unpublish",
    response_model=JobOfferResponse,
)
async def unpublish_job(
    job_id: int,
    service: JobServiceDep,
    current_user: AdminUserDep,
):
    return await service.unpublish_job(job_id)


@router.patch(
    "/{job_id}/expire",
    response_model=JobOfferResponse,
)
async def expire_job(
    job_id: int,
    service: JobServiceDep,
    current_user: AdminUserDep,
):
    return await service.expire_job(job_id)