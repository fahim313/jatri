from datetime import UTC, date, datetime

from fastapi import HTTPException, status

from app.modules.jobs.repositories.jobs import JobRepository
from app.modules.jobs.schemas.jobs import JobOfferCreate, JobOfferUpdate


class JobService:
    def __init__(self, repository: JobRepository):
        self.repository = repository

    async def create_job(self, job_data: JobOfferCreate, managed_by: int):
        job = await self.repository.create({
            **job_data.model_dump(),
            "managed_by": managed_by,
            "status": "Draft",
        })

        await self.repository.session.commit()
        return job

    async def get_job(self, job_id: int):
        job = await self.repository.get_by_id(job_id)

        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job offer not found",
            )

        return job

    async def get_jobs(
        self,
        search: str | None = None,
        country: str | None = None,
        job_status: str | None = None,
    ):
        return await self.repository.get_all(
            search=search,
            country=country,
            status=job_status,
        )

    async def update_job(
        self,
        job_id: int,
        job_data: JobOfferUpdate,
    ):
        job = await self.get_job(job_id)

        updated_job = await self.repository.update(
            job,
            job_data.model_dump(exclude_unset=True),
        )

        await self.repository.session.commit()
        return updated_job

    async def delete_job(self, job_id: int):
        job = await self.get_job(job_id)

        await self.repository.delete(job)
        await self.repository.session.commit()

    async def publish_job(self, job_id: int):
        job = await self.get_job(job_id)

        if (
            job.application_deadline
            and job.application_deadline < date.today()
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot publish an expired job offer",
            )

        job.status = "Published"
        job.last_verified_at = datetime.now(UTC)

        await self.repository.session.commit()
        return job

    async def unpublish_job(self, job_id: int):
        job = await self.get_job(job_id)

        if job.status == "Expired":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Expired job offers cannot be unpublished",
            )

        job.status = "Draft"

        await self.repository.session.commit()
        return job

    async def expire_job(self, job_id: int):
        job = await self.get_job(job_id)

        if (
            job.application_deadline is None
            or job.application_deadline >= date.today()
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Job application deadline has not passed",
            )

        job.status = "Expired"

        await self.repository.session.commit()
        return job

    async def get_public_jobs(
        self,
        search: str | None = None,
        country: str | None = None,
    ):
        return await self.repository.get_all(
            search=search,
            country=country,
            status="Published",
        )

    async def get_public_job(self, job_id: int):
        job = await self.repository.get_by_id(job_id)

        if not job or job.status != "Published":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job offer not found",
            )

        return job