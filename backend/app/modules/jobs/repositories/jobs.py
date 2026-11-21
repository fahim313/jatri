from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.jobs.models.jobs import JobOffer


class JobRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, job_data: dict) -> JobOffer:
        job = JobOffer(**job_data)

        self.session.add(job)
        await self.session.flush()
        await self.session.refresh(job)

        return job

    async def get_by_id(self, job_id: int) -> JobOffer | None:
        result = await self.session.execute(
            select(JobOffer).where(JobOffer.id == job_id)
        )

        return result.scalar_one_or_none()

    async def get_all(
        self,
        search: str | None = None,
        country: str | None = None,
        status: str | None = None,
    ) -> list[JobOffer]:
        query = select(JobOffer)

        if search:
            query = query.where(
                JobOffer.job_title.ilike(f"%{search}%")
                | JobOffer.country.ilike(f"%{search}%")
            )

        if country:
            query = query.where(
                JobOffer.country.ilike(f"%{country}%")
            )

        if status:
            query = query.where(JobOffer.status == status)

        query = query.order_by(JobOffer.id.desc())

        result = await self.session.execute(query)

        return list(result.scalars().all())

    async def update(
        self,
        job: JobOffer,
        job_data: dict,
    ) -> JobOffer:
        for field, value in job_data.items():
            setattr(job, field, value)

        await self.session.flush()
        await self.session.refresh(job)

        return job

    async def delete(self, job: JobOffer) -> None:
        await self.session.delete(job)
        await self.session.flush()